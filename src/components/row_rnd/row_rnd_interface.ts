import { DragEvent, ResizeEvent } from "@interactjs/types/index";
import { DraggableOptions } from "@interactjs/actions/drag/plugin";
import { ResizableOptions } from "@interactjs/actions/resize/plugin";

type EventData = {
  lastLeft: number;
  left: number;
  lastWidth: number;
  width: number;
  top?: number;
};

export type RndDragStartCallback = () => void;
export type RndDragCallback = (
  data: EventData,
  scrollDelta?: number,
) => boolean | void;
export type RndDragEndCallback = (data: Pick<EventData, 'left' | 'width' | 'top' >) => void;

export type Direction = "left" | "right";
export type RndResizeStartCallback = (dir: Direction) => void;
export type RndResizeCallback = (
  dir: Direction,
  data: EventData
) => boolean | void;
export type RndResizeEndCallback = (
  dir: Direction,
  data: Pick<EventData, 'left' | 'width' | 'top'> //TODO Is top needed as its a resize 
) => void;

export interface RowRndApi {
  updateWidth: (size: number) => void;
  updateLeft: (left: number) => void;
  updateTop: (top: number) => void;
  getLeft: () => number;
  getWidth: () => number;
  getTop: () => number;
}

export interface RowRndProps {
  width?: number;
  left?: number;
  top?: number;
  grid?: number;
  start?: number;
  bounds?: { left: number; right: number };
  edges?: { left: boolean | string; right: boolean | string };

  onResizeStart?: RndResizeStartCallback;
  onResize?: RndResizeCallback;
  onResizeEnd?: RndResizeEndCallback;
  onDragStart?: RndDragStartCallback;
  onDrag?: RndDragCallback;
  onDragEnd?: RndDragEndCallback;
  onDrop?: (rowId: string, actionId: string) => void;

  // 同时传入parentRef和deltaScrollLeft时会启动自动滚动
  parentRef?: React.MutableRefObject<HTMLDivElement>;
  deltaScrollLeft?: (delta: number) => void;
  
  children?: React.ReactNode;

  enableResizing?: boolean;
  enableDragging?: boolean;
  draggableOptions?:DraggableOptions;
  resizableOptions?:ResizableOptions;
  adsorptionPositions?: number[];
  adsorptionDistance?: number;
}
