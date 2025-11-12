"""
Rutas de autenticación
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from src.models.schemas import (
    RegisterRequest,
    LoginRequest,
    ValidateRucRequest,
    EmpresaResponse,
    TokenResponse,
    ApiResponse,
    RucDataResponse
)
from src.models.empresa import Empresa
from src.services.auth_service import AuthService
from src.services.ruc_service import RucService, RucValidationError
from src.config.database import get_db
from src.config.settings import settings


router = APIRouter()
security = HTTPBearer()


@router.post("/validate-ruc", response_model=RucDataResponse, status_code=status.HTTP_200_OK)
async def validate_ruc(request: ValidateRucRequest):
    """
    Valida un RUC consultando la API de SUNAT (vía ApiPeru)
    """
    try:
        ruc_data = await RucService.validate_ruc(request.ruc)
        return RucDataResponse(**ruc_data)
    except RucValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al validar RUC: {str(e)}"
        )


@router.post("/register", response_model=ApiResponse, status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest, db: Session = Depends(get_db)):
    """
    Registra una nueva empresa
    
    1. Valida el RUC con SUNAT
    2. Verifica que esté ACTIVO y HABIDO
    3. Verifica que no exista en la BD
    4. Crea la empresa
    """
    try:
        # 1. Validar RUC con SUNAT
        ruc_data = await RucService.validate_ruc(request.ruc)
        
        # 2. Verificar que esté activo y habido
        if not RucService.is_active_company(ruc_data):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"La empresa debe estar ACTIVA y HABIDA. Estado: {ruc_data.get('estado')}, Condición: {ruc_data.get('condicion')}"
            )
        
        # 3. Verificar que no exista
        existing_ruc = db.query(Empresa).filter(Empresa.ruc == request.ruc).first()
        if existing_ruc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El RUC ya está registrado"
            )
        
        existing_email = db.query(Empresa).filter(Empresa.email == request.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        # 4. Crear empresa
        empresa = Empresa(
            ruc=request.ruc,
            razon_social=ruc_data.get("razon_social", ""),
            nombre_comercial=ruc_data.get("nombre_comercial"),
            estado=ruc_data.get("estado", ""),
            condicion=ruc_data.get("condicion", ""),
            direccion=ruc_data.get("direccion"),
            departamento=ruc_data.get("departamento"),
            provincia=ruc_data.get("provincia"),
            distrito=ruc_data.get("distrito"),
            email=request.email,
            password_hash=AuthService.hash_password(request.password)
        )
        
        db.add(empresa)
        db.commit()
        db.refresh(empresa)
        
        return ApiResponse(
            success=True,
            message="Empresa registrada exitosamente",
            data={"ruc": empresa.ruc, "razon_social": empresa.razon_social}
        )
        
    except RucValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar empresa: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Inicia sesión y retorna un token JWT
    """
    try:
        # Buscar empresa por email
        empresa = db.query(Empresa).filter(Empresa.email == request.email).first()
        
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # Verificar contraseña
        if not AuthService.verify_password(request.password, empresa.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas"
            )
        
        # Verificar que la cuenta esté activa
        if not empresa.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="La cuenta está desactivada"
            )
        
        # Actualizar último login
        empresa.last_login = datetime.now()
        db.commit()
        
        # Generar token
        token = AuthService.create_access_token(
            data={"ruc": empresa.ruc, "email": empresa.email}
        )
        
        return TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=settings.JWT_EXPIRATION_HOURS * 3600
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al iniciar sesión: {str(e)}"
        )


@router.get("/profile", response_model=EmpresaResponse, status_code=status.HTTP_200_OK)
async def get_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Obtiene el perfil de la empresa autenticada
    Requiere token JWT en header Authorization: Bearer <token>
    """
    try:
        # Verificar token
        payload = AuthService.verify_token(credentials.credentials)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido o expirado"
            )
        
        # Obtener RUC del token
        ruc = payload.get("ruc")
        if not ruc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        # Buscar empresa
        empresa = db.query(Empresa).filter(Empresa.ruc == ruc).first()
        
        if not empresa:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empresa no encontrada"
            )
        
        return EmpresaResponse(
            ruc=empresa.ruc,
            razon_social=empresa.razon_social,
            nombre_comercial=empresa.nombre_comercial,
            email=empresa.email,
            estado=empresa.estado,
            condicion=empresa.condicion,
            direccion=empresa.direccion,
            departamento=empresa.departamento,
            provincia=empresa.provincia,
            distrito=empresa.distrito,
            is_active=empresa.is_active,
            created_at=empresa.created_at,
            last_login=empresa.last_login
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener perfil: {str(e)}"
        )
