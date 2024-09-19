Pour lancer le projet : clonner le repo, faire npm install, puis npm run start

Ensuite aller sur l'adresse : http://localhost:3000/

Adresse du site de déploiement : https://Akkuun.github.io/POA-SMA-Tank-Project


## Kill serveur node
Linux:
```bash
npx kill-port 3000
```

Windows:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```
