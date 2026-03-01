# ════════════════════════════════════════════════════════
# SECURITY BEST PRACTICES GUIDE
# Multi-Phase Todo Application
# ════════════════════════════════════════════════════════

This document outlines security best practices for managing secrets and sensitive configuration.

## 🔐 Secrets Management

### Kubernetes Secrets

**NEVER commit actual secrets to Git!**

The `secrets.yaml` file in this repository contains only placeholder values. For production use:

1. **Generate Secure Secrets**:
   ```bash
   cd deployment/k8s
   ./generate-secrets.sh
   ```

2. **Or Create Manually**:
   ```bash
   cp secrets.template.yaml secrets-actual.yaml
   # Edit secrets-actual.yaml with actual values
   kubectl apply -f secrets-actual.yaml
   # Delete after applying
   rm secrets-actual.yaml
   ```

3. **Update Secrets**:
   ```bash
   kubectl create secret generic backend-secret \
     --from-literal=SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))') \
     --from-literal=OPENROUTER_API_KEY=your-key \
     -n todo-app \
     --dry-run=client -o yaml | kubectl apply -f -
   ```

### File Permissions

```bash
# Restrict access to secrets files
chmod 600 secrets-actual.yaml
chmod 600 .env.production
```

### Environment Variables

**Development** (`.env`):
- Can use placeholder values
- Safe to commit if no real secrets
- Use `.env.example` as template

**Production** (`.env.production`):
- NEVER commit to Git
- Add to `.gitignore`
- Use secrets management tools

## 🛡️ Security Checklist

### Before Deployment

- [ ] Generate secure `SECRET_KEY` (32+ characters)
- [ ] Set actual API keys (OpenRouter, Gemini, etc.)
- [ ] Configure database credentials
- [ ] Set email credentials if using notifications
- [ ] Review CORS settings
- [ ] Enable HTTPS in production
- [ ] Set `ENVIRONMENT=production`

### Kubernetes Security

- [ ] Use RBAC for access control
- [ ] Enable network policies
- [ ] Use Pod Security Standards
- [ ] Rotate secrets regularly
- [ ] Monitor secret access
- [ ] Use external secrets manager (optional)

### Application Security

- [ ] Enable rate limiting
- [ ] Validate all inputs
- [ ] Use prepared statements (SQL injection prevention)
- [ ] Implement proper authentication
- [ ] Use HTTPS only
- [ ] Set secure cookie flags
- [ ] Enable CORS properly
- [ ] Implement content security policy

## 🔄 Secret Rotation

### Rotate JWT Secret Key

```bash
# Generate new key
NEW_SECRET=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')

# Update Kubernetes secret
kubectl patch secret backend-secret -n todo-app \
  --type='json' \
  -p="[{\"op\": \"replace\", \"path\": \"/stringData/SECRET_KEY\", \"value\": \"$NEW_SECRET\"}]"

# Restart backend
kubectl rollout restart deployment/backend -n todo-app
```

### Rotate API Keys

1. Generate new API key from provider (OpenRouter, etc.)
2. Update Kubernetes secret
3. Restart affected pods
4. Revoke old API key

## 📁 Git Security

### .gitignore Configuration

The following are ignored in `.gitignore`:

```
# Secrets
secrets-actual.yaml
*-secret.yaml
.env
.env.local
.env.production
*.env.secret

# Generated files
*-generated.yaml
```

### Verify No Secrets Committed

```bash
# Check for accidentally committed secrets
git log --all --full-history -- "**/secrets*.yaml"
git grep -i "api_key\|secret_key\|password" -- "*.yaml" "*.yml" "*.env"
```

## 🔍 Monitoring & Auditing

### Kubernetes Audit Logs

```bash
# Watch secret access
kubectl get events -n todo-app --field-selector involvedObject.kind=Secret

# Check who accessed secrets
kubectl audit-policy -n todo-app
```

### Application Logs

```bash
# Monitor for authentication failures
kubectl logs -n todo-app deployment/backend | grep -i "unauthorized\|forbidden"

# Monitor API usage
kubectl logs -n todo-app deployment/backend | grep -i "api\|rate.limit"
```

## 🚨 Incident Response

### If Secrets Are Compromised

1. **Immediately rotate all compromised secrets**
2. **Revoke API keys** from providers
3. **Restart all pods** to invalidate cached credentials
4. **Review audit logs** for unauthorized access
5. **Update monitoring** to detect similar incidents
6. **Document incident** and update security procedures

### Emergency Contacts

- OpenRouter: https://openrouter.ai/support
- Gemini API: https://support.google.com/
- Kubernetes Security: https://kubernetes.io/security/

## 📚 Additional Resources

- [Kubernetes Secrets Best Practices](https://kubernetes.io/docs/concepts/configuration/secret/)
- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12-Factor App - Config](https://12factor.net/config)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

## 🛠️ Tools

### Secret Generation

```bash
# Secure random string
python3 -c 'import secrets; print(secrets.token_urlsafe(32))'

# Base64 encode (for Kubernetes)
echo -n "my-secret" | base64

# Generate password
openssl rand -base64 32
```

### Secret Validation

```bash
# Check if secret exists
kubectl get secret backend-secret -n todo-app

# View secret keys (not values)
kubectl get secret backend-secret -n todo-app -o jsonpath='{.data}' | jq 'keys'

# Decode secret value (for verification)
kubectl get secret backend-secret -n todo-app -o jsonpath='{.data.SECRET_KEY}' | base64 -d
```

---

**Remember**: Security is an ongoing process, not a one-time setup. Regularly review and update your security practices.
