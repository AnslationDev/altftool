const seo = {
  intro:
    "The Texture Prompt Generator assembles a precise, structured text prompt describing a surface — base material, finish, physical scale, lighting, wear state and output target — for AI image and texture generators. It follows the subject-first prompt ordering that CLIP-based text encoders weight most heavily, and adds a matching negative prompt covering the common failure modes of texture generation such as watermarks, seams and uneven lighting. It is built for 3D artists, game developers and designers who need seamless tiles, PBR reference captures or hero material renders.",
  useCases: [
    "A game environment artist generating a seamless tileable texture of weathered oak planks for a 3D scene",
    "A product designer creating PBR-ready reference captures of brushed steel under flat, even lighting for albedo extraction",
    "An architectural visualiser prompting a photoreal 2 m concrete panel with raking light to show surface relief",
  ],
  benefits: [
    ["Structured, model-friendly ordering", "Material comes first, constraints last — the ordering diffusion text encoders parse most reliably."],
    ["Real-world scale control", "States a physical patch size (2 cm to 2 m) — the most dependable way to control feature size in texture prompts."],
    ["Matching negative prompt", "Automatically adds seam, vignette and watermark negatives when the output must tile."],
  ],
  faqs: [
    [
      "How do I write a prompt for a seamless tileable texture?",
      "Name the material first, then add the phrases 'seamless tileable texture', 'top-down orthographic view' and 'uniform lighting, no vignette'. Uneven lighting and perspective are what break tiling, so the prompt must force a flat, evenly lit, straight-down capture — this generator adds all of those constraints automatically when you pick the seamless target.",
    ],
    [
      "What is a negative prompt and do I need one for textures?",
      "A negative prompt lists what the model should avoid, and for textures the recurring failures are text, watermarks, objects on the surface, blur, visible seams and vignetting. Stable Diffusion and similar models accept a separate negative field; Midjourney uses the --no parameter; DALL-E has no negative field, so you can simply omit it there.",
    ],
    [
      "How do I control how zoomed-in a texture looks?",
      "State a real-world patch size in the prompt, such as 'extreme macro close-up of a 2 cm surface patch' versus 'straight-on view of a 2 m wide surface panel'. Physical dimensions are more reliable than vague words like 'zoomed in' because the model anchors feature size — grain, cracks, weave — to the stated scale.",
    ],
    [
      "Can I use these prompts to make PBR material maps?",
      "Yes, as a starting point: pick the PBR reference target, which requests a top-down orthographic capture under flat even lighting suitable for albedo extraction. You then feed the generated image into a material tool (such as Substance Sampler or an AI PBR generator) to derive normal, roughness and height maps from it.",
    ],
  ],
};

export default seo;
