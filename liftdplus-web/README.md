# Liftd+ MVP Application
This directory contains the implementation for the MVP.


## How to: Run Locally
### With Docker (Preferred)

If you are on mac, consider using:

```bash
docker compose up --watch
```
This enables the following:
 - Automatic installation of package dependencies
 - Hot-reloading by setting a watch function on the core project

### Window users
To run a docker container, you will need WSL (Windows Subsystem for Linux)[https://learn.microsoft.com/en-us/windows/wsl/install] in addition to Docker.

### Run Local with npm
```
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
