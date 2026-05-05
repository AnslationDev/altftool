import altftool from "./altftool/config";
import leadtree from "./leadtree/config";

export const PROJECTS = {
    altftool,
    leadtree,
};

export const getProject = (projectId) => {
  return PROJECTS[projectId];
};