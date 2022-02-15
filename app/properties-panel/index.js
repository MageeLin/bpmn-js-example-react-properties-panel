import ReactDOM from 'react-dom';
import React from 'react';

import PropertiesView from './PropertiesView';

// 将PropertiesView绑定到给定的container节点上，并且将modeler传递下去
export default class PropertiesPanel {

  constructor(options) {

    const {
      modeler,
      container
    } = options;

    ReactDOM.render(
      <PropertiesView modeler={ modeler } />,
      container
    );
  }
}


