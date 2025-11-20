# Proxy Setup

To set up the proxy:
* bash
```bash
docker run -d \
  --name lmstudio-proxy \
  -p 1234:1234 \
  -e API_SECRET_KEY=my-secret-key \
  -v .htpasswd:/etc/nginx/.htpasswd:ro \
  -v ./nginx.conf.template:/etc/nginx/templates/nginx.conf.template:ro \
  nginx:latest
```
* powershell
```ps1
docker stop lmstudio-proxy
docker rm lmstudio-proxy


docker run -d `
  --name lmstudio-proxy `
  -p 1234:1234 `
  -e API_SECRET_KEY=my-secret-key `
  -v ${PWD}\nginx.conf.template:/etc/nginx/templates/nginx.conf.template:ro `
  -v ${PWD}/.htpasswd:/etc/nginx/.htpasswd:ro `
  nginx:latest
```
admin admin

```bash
# Build and start Traefik
docker compose up -d

# Check logs
docker compose logs -f traefik

```

## Verify
```ps1
Invoke-WebRequest -Uri "http://localhost:1234/v1/models" -Headers @{
    Authorization = "Bearer my-secret-key"
}
```

## Links

- [Back to README](../readme.md)