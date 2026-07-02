import altftool from "./altftool/config";
import leadtree from "./leadtree/config";
import myluckydeal from "./myluckydeal/config";

export const PROJECTS = {
    altftool,
    leadtree,
    myluckydeal,
};

export const getProject = (projectId) => {
  return PROJECTS[projectId];
};