import React, { FC, useRef } from 'react';
import { TimelineRow } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime } from '../../utils/deal_data';
import { DragLineData } from './drag_lines';
import { EditAction } from './edit_action';
import './edit_row.less';
import { InteractComp } from '../row_rnd/interactable';
import { Interactable } from '@interactjs/types';

export type EditRowProps = CommonProp & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  rowData?: TimelineRow;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
  /** 距离左侧滚动距离 */
  scrollLeft: number;
  /** 设置scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};

export const EditRow: FC<EditRowProps> = (props) => {
  const {
    rowData,
    style = {},
    onClickRow,
    onDoubleClickRow,
    onContextMenuRow,
    areaRef,
    scrollLeft,
    startLeft,
    scale,
    scaleWidth,
  } = props;

  const interactable = useRef<Interactable>();

  const classNames = ['edit-row'];
  if (rowData?.selected) classNames.push('edit-row-selected');

  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + scrollLeft;
    const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    return time;
  };

  return (
    <InteractComp
      interactRef={interactable}
      draggable
      draggableOptions={{
        startAxis: 'y',
        lockAxis:'start',
        onmove: (a,b,c)=>{
          console.log("onmove",a,b,c)
          console.log(a.currentTarget)
          console.log(a.relatedTarget)
        },
        onstart: (a,b,c)=>{
          console.log("onstart",a,b,c)
        },
        onend: (a,b,c)=>{
          console.log("onend",a,b,c)
        },
        cursorChecker: () => {
          return null;
        },
      }}
      resizable={false}
      key={rowData?.id}
      resizableOptions={null}
    >
      <div
        className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(
          ' ',
        )}`}
        style={style}
        data-row-id={rowData?.id}
        onClick={(e) => {
          if (rowData && onClickRow) {
            const time = handleTime(e);
            onClickRow(e, { row: rowData, time: time });
          }
        }}
        onDoubleClick={(e) => {
          if (rowData && onDoubleClickRow) {
            const time = handleTime(e);
            onDoubleClickRow(e, { row: rowData, time: time });
          }
        }}
        onContextMenu={(e) => {
          if (rowData && onContextMenuRow) {
            const time = handleTime(e);
            onContextMenuRow(e, { row: rowData, time: time });
          }
        }}
      >

      {(rowData?.actions || []).map((action) => (
        <EditAction
          key={action.id}
          {...props}
          handleTime={handleTime}
          row={rowData}
          action={action}
        />
      ))}
      </div>
    </InteractComp>
  );
};
