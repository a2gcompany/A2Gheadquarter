#!/bin/bash

echo "🚀 Iniciando túnel público para el puerto 3000..."
echo ""

# Iniciar localtunnel y capturar la URL
lt --port 3000 &

# Esperar a que el túnel esté listo
sleep 3

echo ""
echo "✅ Túnel activo!"
echo ""
echo "🌐 Accede a tu aplicación en:"
echo ""

# Intentar obtener la URL del log
if pgrep -f "lt --port" > /dev/null; then
    echo "   https://[subdomain-random].loca.lt"
    echo ""
    echo "📝 La URL exacta se mostrará en los logs de localtunnel"
    echo "   o prueba directamente con tu navegador"
else
    echo "❌ Error: No se pudo iniciar el túnel"
fi

# Mantener el script corriendo
wait
