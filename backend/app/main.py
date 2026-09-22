from fastapi import FastAPI

app = FastAPI(
    title="TerraShield AI",
    description="Hyper-local Landslide and Flash-Flood Early Warning System",
    version="0.1.0"
)


@app.get("/")
def root():
    return {
        "system": "TerraShield AI",
        "status": "online",
        "message": "Disaster intelligence system operational"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }