const toolConfig = {
  slug: "env-to-kubernetes-secret-converter",
  name: "Env to Kubernetes Secret Converter",
  category: ["Converters"],
  description:
    "Convert a .env file into a Kubernetes Secret manifest with base64-encoded data or plain stringData, validated against k8s naming rules.",
  icon: "container",
  iconColor: "text-(--primary)",
};

export default toolConfig;
