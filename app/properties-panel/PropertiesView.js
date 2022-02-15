import { is } from 'bpmn-js/lib/util/ModelUtil';

import React, { Component } from 'react';

import './PropertiesView.css';

// 属性面板类
export default class PropertiesView extends Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedElements: [],
      element: null
    };
  }

  componentDidMount() {

    const {
      modeler
    } = this.props;

    // 当选择项改变时
    // e => {type,oldSelection,newSelection}
    modeler.on('selection.changed', (e) => {
      const {
        element
      } = this.state;

      this.setState({
        selectedElements: e.newSelection,
        element: e.newSelection[0]
      });
    });

    // 当element改变时
    // e => {element,gfx,type}
    modeler.on('element.changed', (e) => {

      const {
        element
      } = e;

      const {
        element: currentElement
      } = this.state;

      if (!currentElement) {
        return;
      }

      // 如果当前选中的element改变了，则更新panel
      if (element.id === currentElement.id) {
        this.setState({
          element
        });
      }

    });
  }

  render() {

    const {
      modeler
    } = this.props;

    const {
      selectedElements,
      element
    } = this.state;

    return (
      <div>

        {
          selectedElements.length === 1
            && <ElementProperties modeler={ modeler } element={ element } />
        }

        {
          selectedElements.length === 0
            && <span>Please select an element.</span>
        }

        {
          selectedElements.length > 1
            && <span>Please select a single element.</span>
        }
      </div>
    );
  }

}


// element属性组件
function ElementProperties(props) {

  let {
    element,
    modeler
  } = props;

  if (element.labelTarget) {
    element = element.labelTarget;
  }

  function updateName(name) {
    const modeling = modeler.get('modeling');

    // 简单的更新label
    modeling.updateLabel(element, name);
  }

  function updateTopic(topic) {
    const modeling = modeler.get('modeling');

    // 复杂一点的元属性更新
    modeling.updateProperties(element, {
      'custom:topic': topic
    });
  }

  // 使当前element变为MessageEvent
  function makeMessageEvent() {

    const bpmnReplace = modeler.get('bpmnReplace');

    bpmnReplace.replaceElement(element, {
      type: element.businessObject.$type,
      eventDefinitionType: 'bpmn:MessageEventDefinition'
    });
  }

  // 使当前element变为ServiceTask
  function makeServiceTask(name) {
    const bpmnReplace = modeler.get('bpmnReplace');

    bpmnReplace.replaceElement(element, {
      type: 'bpmn:ServiceTask'
    });
  }

  // 附加一个Timeout
  function attachTimeout() {
    const modeling = modeler.get('modeling');
    const autoPlace = modeler.get('autoPlace');
    const selection = modeler.get('selection');

    const attrs = {
      type: 'bpmn:BoundaryEvent',
      eventDefinitionType: 'bpmn:TimerEventDefinition'
    };

    const position = {
      x: element.x + element.width,
      y: element.y + element.height
    };

    const boundaryEvent = modeling.createShape(attrs, position, element, { attach: true });

    const taskShape = append(boundaryEvent, {
      type: 'bpmn:Task'
    });

    selection.select(taskShape);
  }

  // 判断是否为TimerEventDefinition
  function isTimeoutConfigured(element) {
    const attachers = element.attachers || [];

    return attachers.some(e => hasDefinition(e, 'bpmn:TimerEventDefinition'));
  }

  // 通用的附加方法
  function append(element, attrs) {

    const autoPlace = modeler.get('autoPlace');
    const elementFactory = modeler.get('elementFactory');

    var shape = elementFactory.createShape(attrs);

    return autoPlace.append(element, shape);
  };


  return (
    <div className="element-properties" key={ element.id }>
      <fieldset>
        <label>编号</label>
        <span>{ element.id }</span>
      </fieldset>

      <fieldset>
        <label>名称</label>
        <input value={ element.businessObject.name || '' } onChange={ (event) => {
          updateName(event.target.value)
        } } />
      </fieldset>

      {
        is(element, 'custom:TopicHolder') &&
          <fieldset>
            <label>主题 (custom)</label>
            <input value={ element.businessObject.get('custom:topic') } onChange={ (event) => {
              updateTopic(event.target.value)
            } } />
          </fieldset>
      }

      <fieldset>
        <label>行为</label>

        {
          is(element, 'bpmn:Task') && !is(element, 'bpmn:ServiceTask') &&
            <button onClick={ makeServiceTask }>变为 Service Task</button>
        }

        {
          is(element, 'bpmn:Event') && !hasDefinition(element, 'bpmn:MessageEventDefinition') &&
            <button onClick={ makeMessageEvent }>变为 Message Event</button>
        }

        {
          is(element, 'bpmn:Task') && !isTimeoutConfigured(element) &&
            <button onClick={ attachTimeout }>附加一个 Timeout</button>
        }
      </fieldset>
    </div>
  );
}


// helpers ///////////////////
// 通用的判断方法
function hasDefinition(event, definitionType) {

  const definitions = event.businessObject.eventDefinitions || [];

  return definitions.some(d => is(d, definitionType));
}
