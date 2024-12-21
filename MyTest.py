from huggingface_hub import list_models

models = list_models(filter="text-to-image")

for model in models:
    print(model.modelId)