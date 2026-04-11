# Rest Projectt

API REST que permite registrar usuarios, crear categoriar y productos, validando token's.

## Seguridad (auditoría de dependencias y endurecimiento)

- `npm audit` sin vulnerabilidades conocidas en dependencias directas/transitivas (revisar periódicamente).
- Eliminado el SDK AWS v2 duplicado; solo `@aws-sdk/client-s3` v3.
- `nodemailer` en versión mayor con parches de seguridad.
- Cabeceras HTTP con `helmet` (CSP desactivado para no romper el front servido desde el mismo servidor).
- Límite de frecuencia en login/registro/recuperación de contraseña y en envío de correos de contacto/pedidos (`express-rate-limit`).
- Escape de HTML en plantillas de correo (pedidos, contacto, aprobación de usuarios, recuperación de contraseña) para evitar inyección en clientes de correo.
- Tras un proxy inverso o balanceador, definir `TRUST_PROXY=true` en `.env` para que los límites por IP usen la IP real del cliente.

## Instalación

1. Clonar .env.template a .env y configurar las variables de entorno
2. Ejecutar `npm install` para instalar las dependencias
3. En caso de necesitar base de datos, configurar el docker-compose.yml y ejecutar `docker-compose up -d` para levantar los servicios deseados.
4. Ejecutar `npm run dev` para levantar el proyecto en modo desarrollo
