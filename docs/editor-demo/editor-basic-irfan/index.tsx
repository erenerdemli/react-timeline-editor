import { cloneDeep } from 'lodash';
import React, { useEffect, useState } from 'react';
import './index.less';
import { mockData, mockEffect } from './mock';
import { Timeline, } from '../../../src/components/timeline';
import interact from 'interactjs';
import { RowDnd } from '../../../src/components/row_rnd/row_rnd';
import { EditAction } from '../../../src/components/edit_area/edit_action';
const defaultEditorData = cloneDeep(mockData);

const TimelineEditor = () => {
  const [data, setData] = useState(defaultEditorData);

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

  return (
    <>

{/* <EditAction
action={{id:'1003404', effectId:null,start:0, end:100,selected:false}}
data-id="1001"
  row={{id:"1001",classNames:["dd"], rowHeight:100,selected:false}}

  scaleCount={1}
  setScaleCount={()=>{}}
  timelineWidth={100}
  editorData={[]}
><div>EditRow demo</div></EditAction> */}
<div className='timeline-editor-action' data-id="actionitem" data-action-id="495959">Dem2MEm</div>
<RowDnd key="444444" 
        classNamesX="action"
        data-id="actionitem"
data-action-id="20002"><div>DEMO DROP</div></RowDnd>

    <br /><br /><br /><br /><br /><br /><br />
    <div className="timeline-editor-example0">
      <Timeline
        onChange={setData}
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
