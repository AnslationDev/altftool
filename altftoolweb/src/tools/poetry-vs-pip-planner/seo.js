const seo = {
  intro:
    "This planner scores uv, Poetry, pip + pip-tools and conda against your project's actual needs and returns a ranked recommendation with the reason behind every point. It uses an additive scoring model built from each tool's documented capabilities — lockfile format, PyPI publishing, binary package support, interpreter management and workspace handling — so the ranking is fully explainable, not a black box. It is for Python developers choosing (or defending) a packaging workflow for an application, a PyPI library or a data science stack.",
  useCases: [
    "Choosing between Poetry and uv for a new FastAPI service where CI install speed and a cross-platform lockfile both matter",
    "Deciding whether a machine learning project with CUDA and GDAL dependencies genuinely needs conda or can stay on pip wheels",
    "Justifying a migration off requirements.txt to your team with a side-by-side table of lockfiles, publishing and workspace support",
  ],
  benefits: [
    ["Explainable ranking", "Every point in the score maps to one stated reason, so you can defend the recommendation in a team discussion."],
    ["Real capability data", "The comparison table reflects each tool's own documentation — uv.lock, poetry publish, pip-compile, conda-lock — not opinions."],
    ["Starter commands included", "The winning manager comes with the exact install and init commands to run first."],
  ],
  faqs: [
    [
      "Should I use uv or Poetry for a new Python project?",
      "For most new projects uv is the stronger default: its Rust resolver installs 10-100x faster than pip in Astral's published benchmarks, it writes a single cross-platform uv.lock, manages Python interpreter versions itself, and has first-class workspaces. Poetry remains an excellent choice for libraries, where its mature poetry build and poetry publish flow has years of production use.",
    ],
    [
      "When do I actually need conda instead of pip?",
      "You need conda (or mamba) when your project depends on non-Python binaries that pip wheels do not cover — CUDA toolkits, GDAL/geospatial stacks, MKL, or R integration. If every dependency ships a wheel on PyPI, a pip-based tool is lighter and faster; conda's real advantage is distributing arbitrary compiled software, not managing Python packages.",
    ],
    [
      "What is the difference between pip-tools and Poetry?",
      "pip-tools is a thin layer over pip: pip-compile pins your dependencies into an ordinary requirements.txt that any vanilla pip can install, but you keep managing virtualenvs and builds yourself. Poetry is an all-in-one tool with its own poetry.lock, automatic virtualenvs, dependency groups and PyPI publishing. Choose pip-tools when your platform expects plain pip artifacts; choose Poetry when you want one tool for the whole workflow.",
    ],
    [
      "Do I need a lockfile for a Python project?",
      "Yes for anything deployed or shared: a lockfile pins every transitive dependency so your laptop, CI and production install identical versions. uv (uv.lock) and Poetry (poetry.lock) produce cross-platform lockfiles automatically; pip-tools pins a requirements.txt per platform; conda needs the separate conda-lock project. Without one, a transitive release can change your production environment silently.",
    ],
  ],
};

export default seo;
