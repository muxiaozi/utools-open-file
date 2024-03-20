const nativeId = utools.getNativeId();
const softwareKey = nativeId + "/softwares";

function addSoftware(path) {
  path = path.replace(/\\/g, "/");
  if (!require("fs").existsSync(path)) {
    utools.showNotification("添加失败: 文件不存在 " + path);
    return;
  }
  let softwares = utools.dbStorage.getItem(softwareKey);
  if (softwares == null) {
    softwares = [];
  }
  if (softwares.some((software) => software.path == path)) {
    utools.showNotification("重复添加: " + path);
    return;
  }
  softwares.push({
    path: path,
    name: path.split("/").pop(),
  });
  utools.dbStorage.setItem(softwareKey, softwares);
  utools.showNotification("添加成功: " + path);
}

function deleteSoftware(path) {
  let softwares = utools.dbStorage.getItem(softwareKey);
  if (softwares == null) {
    utools.showNotification("删除失败: " + path + " 不存在");
    return;
  }
  softwares = softwares.filter((software) => software.path != path);
  utools.dbStorage.setItem(softwareKey, softwares);
  utools.showNotification("删除成功: " + path);
}

function getSoftwares(filter) {
  let softwares = utools.dbStorage.getItem(softwareKey);
  if (softwares == null) {
    return [];
  }
  if (filter) {
    return softwares.filter((software) => software.name.toLowerCase().includes(filter.toLowerCase()));
  }
  return softwares;
}

window.exports = {
  open_file: {
    mode: "list",
    args: {
      enter: (action, callbackSetList) => {
        list = getSoftwares().map((software) => {
          return {
            title: software.name,
            description: software.path,
            url: software.path,
          };
        });
        callbackSetList(list);
      },
      search: (action, searchWord, callbackSetList) => {
        list = getSoftwares(searchWord).map((software) => {
          return {
            title: software.name,
            description: software.path,
            url: software.path,
          };
        });
        callbackSetList(list);
      },
      select: (action, itemData, callbackSetList) => {
        utools.hideMainWindow();
        if (!require("fs").existsSync(itemData.url)) {
          utools.showNotification("打开失败: 打开方式不存在 " + itemData.url);
        } else {
          require("child_process").spawn(
            itemData.url,
            action.payload.map((file) => file.path)
          );
        }
        utools.outPlugin();
      },
      placeholder: "选择打开方式",
    },
  },
  add_software: {
    mode: "none",
    args: {
      enter: (action) => {
        utools.hideMainWindow();
        if (action.type == "files") {
          for (const file of action.payload) {
            addSoftware(file.path);
          }
        } else if (action.type == "regex") {
          addSoftware(action.payload);
        } else if (action.type == "window") {
          addSoftware(action.payload.appPath);
        } else {
          utools.showNotification(
            "添加失败: 未知的添加方式 " + JSON.stringify(action)
          );
        }
        utools.outPlugin();
      },
    },
  },
  delete_software: {
    mode: "list",
    args: {
      enter: (action, callbackSetList) => {
        list = getSoftwares().map((software) => {
          return {
            title: software.name,
            description: software.path,
            url: software.path,
          };
        });
        callbackSetList(list);
      },
      search: (action, searchWord, callbackSetList) => {
        list = getSoftwares(searchWord).map((software) => {
          return {
            title: software.name,
            description: software.path,
            url: software.path,
          };
        });
        callbackSetList(list);
      },
      select: (action, itemData, callbackSetList) => {
        utools.hideMainWindow();
        deleteSoftware(itemData.url);
        utools.outPlugin();
      },
      placeholder: "选择要删除的打开方式",
    },
  },
};
