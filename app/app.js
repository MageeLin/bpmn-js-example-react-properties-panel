import Modeler from 'bpmn-js/lib/Modeler';

import PropertiesPanel from './properties-panel';

import customModdleExtension from './moddle/custom.json';

import diagramXML from './diagram.bpmn';

const $modelerContainer = document.querySelector('#modeler-container');
const $propertiesContainer = document.querySelector('#properties-container');

const modeler = new Modeler({
  container: $modelerContainer,
  // 绑定一个自定义的元数据
  moddleExtensions: {
    custom: customModdleExtension
  },
  keyboard: {
    bindTo: document.body
  }
});

// 通过modeler来跟图表进行数据同步
const propertiesPanel = new PropertiesPanel({
  container: $propertiesContainer,
  modeler
});

modeler.importXML(diagramXML);