import { cloneDeep } from 'lodash';
import React, { useEffect, useState, useRef } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';
import { Timeline, TimelineAction, InteractComp } from 'c8-react-timeline-editor';
import interact from 'interactjs';
import { RowDnd } from '../../../src/components/row_rnd/row_rnd';
import { EditAction } from '../../../src/components/edit_area/edit_action';
import { Interactable } from '@interactjs/types';
import { prefix } from '../../../src/utils/deal_class_prefix';

const defaultEditorData = cloneDeep(mockData);

const TimelineEditor = () => {
  const [data, setData] = useState(defaultEditorData);
  const interactable = useRef<Interactable>();

  React.useEffect(() => {
    console.log('data updated', data);

    // interact('.actionItem')
    // .origin('self')
    // .draggable({})

  }, [data]);

  const handleOnMoveEnd = (...params) => {
    console.log('actionMoveEnd', params);
  };

  const handleOnResizeEnd = (...params) => {
    console.log('handleOnResizeEnd', params);
  }; 

  const handleOnClickRow = (...params) => {
    console.log('handleOnClickRow', params);
  };

  const handleOnContextMenuRow = (...params) => {
    console.log('handleOnContextMenuRow', params);
  };

  const classNames = ['action'];

  return (
    <>


<RowDnd
  onDrop={(e)=>{
    console.log("ExternalDropped", e)
  }}
  draggableOptions={
    {
      onend : (e)=>console.log("On End",e)
    }
  }
  enableResizing={false}
>
          <div  style={{position:"relative", width:'100px', maxWidth:"100px"}}  className='timeline-editor-action timeline-editor-action-movable timeline-editor-action-flexible timeline-editor-action-effect-effect0' data-action-id="action001" data-id="actionitem">RowDnd</div>

          </RowDnd>
          <br></br>
          <InteractComp
            interactRef={interactable}
            draggable
            draggableOptions={{}}
            resizable={false}
            resizableOptions={null}
          >
          <div  data-row-id={0} style={{position:"relative", width:'100px', maxWidth:"100px"}}  className='timeline-editor-action timeline-editor-action-movable timeline-editor-action-flexible timeline-editor-action-effect-effect0' data-action-id="action001" data-id="actionitem">InteractComp</div>

          </InteractComp>
        
    <br></br>


    <div className="timeline-editor-example0">
      <Timeline
        onChange={(e)=>{
          console.log(e)
        }}
        editorData={data}
        effects={mockEffect}
        hideCursor={false}
        autoScroll
        autoReRender
        onActionMoveEnd={handleOnMoveEnd}
        onActionResizeEnd={handleOnResizeEnd}
        onClickActionOnly={handleOnClickRow}
        onContextMenuAction={handleOnContextMenuRow}
        gridSnap
        dragLine
      />
    </div>
    </>
  );
};

export default TimelineEditor;
