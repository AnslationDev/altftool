import altftool from "./altftool/config";
import leadtree from "./leadtree/config";
import carrerbook from "./carrerbook/config";

export const PROJECTS = {
    altftool,
    leadtree,
    carrerbook
};

export const getProject = (projectId) => {
  return PROJECTS[projectId];
};