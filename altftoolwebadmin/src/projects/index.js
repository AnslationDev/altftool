import alphobia from "./alphobia/config";
import altftool from "./altftool/config";
import leadtree from "./leadtree/config";
import smartlucky from "./smartlucky/config";
import marketys from "./marketys/config";

export const PROJECTS = {
  altftool,
  leadtree,
  smartlucky,
  alphobia,
  marketys,
};

export const getProject = (projectId) => {
  return PROJECTS[projectId];
};