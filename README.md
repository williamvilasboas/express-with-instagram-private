# Instagram with Express Publish and Login

Criado para publicar fotos no instagram.

### Requeriments

- NodeJs > 8
- NPM
- Browser-refresh (Dev)
- Pm2 (Production)

### Installation

```
npm install
```

```
cp .env.development.example .env
```

### Usage (Dev)

```
npm start
```

### Usage (Prod)

```
npm run build
```

### Test links

- [status](http://localhost:9028/status)

### Routes

#### Sign-In

```js
request("http://localhost:9028/auth/sign-in", {
  method: "POST",
  json: true,
  data: {
    username: "",
    password: ""
  }
});
```

#### Logout

```js
request("http://localhost:9028/auth/logout", {
  method: "POST",
  json: true,
  data: {
    username: ""
  }
});
```

#### Perfil do Usuário (Logado)

```js
request("http://localhost:9028/auth/get-profile", {
  method: "POST",
  json: true,
  data: {
    username: ""
  }
});
```

#### Verificação de login SMS

```js
request("http://localhost:9028/auth/sign-in/verification/sms", {
  method: "POST",
  json: true,
  data: {
    username: "",
    code: ""
  }
});
```

### Seleção de metodo de verificação

```js
request("http://localhost:9028/auth/sign-in/challenge-select", {
  method: 'POST',
  data: {
    username: ""
  },
  json: true
})
```

#### Publicação de Image

```js
request("http://localhost:9028/publish/photo", {
  method: "POST",
  json: true,
  data: {
    username: "",
    file: "", // o arquivo já deve esta no servidor
    caption: "Apenas um teste de postagem"
  }
});
```

#### Publicação de Album

```js
request("http://localhost:9028/publish/album", {
  method: "POST",
  data: {
    username: "",
    files: [""], // o arquivo já deve esta no servidor, tem que ser enviado ao menos 2 imagens!
    caption: "Apenas um teste de postagem"
  }
});
```
