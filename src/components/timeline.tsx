import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { ScrollSync } from 'react-virtualized';
import { ITimelineEngine, TimelineEngine } from '../engine/engine';
import { MIN_SCALE_COUNT, PREFIX, START_CURSOR_TIME } from '../interface/const';
import { TimelineEditor, TimelineRow, TimelineState } from '../interface/timeline';
import { checkProps } from '../utils/check_props';
import { getScaleCountByRows, parserPixelToTime, parserTimeToPixel } from '../utils/deal_data';
import { Cursor } from './cursor/cursor';
import { EditArea } from './edit_area/edit_area';
import './timeline.less';
import { TimeArea } from './time_area/time_area';
import interact from 'interactjs';

export const Timeline = React.forwardRef<TimelineState, TimelineEditor>((props, ref) => {
  const checkedProps = checkProps(props);
  const { style, onDrop } = props;
  let {
    effects,
    editorData: data,
    scrollTop,
    autoScroll,
    hideCursor,
    disableDrag,
    scale,
    scaleWidth,
    startLeft,
    minScaleCount,
    maxScaleCount,
    onChange,
    engine,
    autoReRender = true,
    onScroll: onScrollVertical,
    onCollisionActive,
    onCollisionInActive,
  } = checkedProps;

  const engineRef = useRef<ITimelineEngine>(engine || new TimelineEngine());
  const domRef = useRef<HTMLDivElement>();
  const areaRef = useRef<HTMLDivElement>();
  const scrollSync = useRef<ScrollSync>();
  const editorDataRef = useRef<TimelineRow[]>(data);

  // 编辑器数据
  const [editorData, setEditorData] = useState(data);
  // scale数量
  const [scaleCount, setScaleCount] = useState(MIN_SCALE_COUNT);
  // 光标距离
  const [cursorTime, setCursorTime] = useState(START_CURSOR_TIME);
  // 是否正在运行
  const [isPlaying, setIsPlaying] = useState(false);
  // 当前时间轴宽度
  const [width, setWidth] = useState(Number.MAX_SAFE_INTEGER);

  useEffect(() => {
    interact('.timeline-editor-edit-row').dropzone({
      accept: '.timeline-editor-action',
      overlap: 0.4,
      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
      },
      ondragenter: function (event) {
        let draggableElement = event.relatedTarget;
        let dropzoneElement = event.target;
        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
        // draggableElement.textContent = 'Dragged in';
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        // event.relatedTarget.textContent = 'Dragged out';
      },
      ondrop: function (event) {
        console.log("On Drop to Dropzone")
        if (event) {
          event.stopPropagation();
        }
        const rowId = event.currentTarget.getAttribute('data-row-id');
        console.log("On Drop to Dropzone with row id",rowId)
        /**
         * Not Dropped on to a Row, Skip
         */
        if(!rowId){
          alert('not a row')
          return
        }
        const actionId = event.relatedTarget.getAttribute('data-action-id');
        let droppedRowData = null;
        let oldRowId = null;
        let actionData = null;

        editorDataRef.current.forEach((f) => {
          const hasAction = f.actions.find((e) => e.id === actionId);
          if (hasAction) {
            oldRowId = f.id;
            actionData = hasAction;
            const { actions, ...restProps } = f;
            droppedRowData = restProps;
          }
        });
        if (oldRowId === rowId) return;
        if (!Array.isArray(editorDataRef.current)) return null;

        const modifiedEditorData = editorDataRef.current.map((er) => {
          if (er.id === rowId) {
            const currActions = er.actions || [];
            const updatedActions = currActions.concat(actionData);
            const nonNullActions = updatedActions.filter((f) => !!f);
            return {
              ...er,
              actions: nonNullActions,
            };
          } else if (er.id === oldRowId) {
            const updatedActions = er.actions.filter((f) => f.id !== actionData.id);
            const nonNullActions = updatedActions.filter((f) => !!f);
            return {
              ...er,
              actions: nonNullActions,
            };
          }
          return er;
        });
        // update actions
        setEditorData(modifiedEditorData);
        handleEditorDataChange(modifiedEditorData);
        if (onDrop) {
          onDrop(rowId, actionId);
        }
      },
      ondropdeactivate: function (event) {
        event.stopPropagation();
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
        event.relatedTarget.style.removeProperty('top');
      },
    });
  }, []);

  useEffect(() => {
    interact('div[data-id="actionitem"]').dropzone({
      accept: '.timeline-editor-action',
      overlap: 0.01,
      ondropactivate: function (event) {
        // add active dropzone feedback
        //console.log('running dropactivate collison');
      },

      ondragenter: function (event) {
        event.target.classList.add('collison-active');
        if (onCollisionActive) {
          //onCollisionActive(targetRowId, targetActionId, true);
        }
        // dropzoneElement.classList.add('drop-target');
        // draggableElement.classList.add('can-drop');
        // draggableElement.textContent = 'Dragged in';
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('collison-active');
        if (onCollisionInActive) {
          onCollisionInActive();
        }
        // event.target.classList.remove('drop-target');
        // event.relatedTarget.classList.remove('can-drop');
        // event.relatedTarget.textContent = 'Dragged out';
      },

      ondropdeactivate: function (event) {
        event.stopPropagation();
        // remove active dropzone feedback
        event.target.classList.remove('collison-active');
      },
    });
  }, []);

  /** 监听数据变化 */
  useLayoutEffect(() => {
    handleSetScaleCount(getScaleCountByRows(data, { scale }));
    setEditorData(data);
  }, [data, minScaleCount, maxScaleCount, scale]);

  useEffect(() => {
    engineRef.current.effects = effects;
  }, [effects]);

  useEffect(() => {
    engineRef.current.data = editorData;
  }, [editorData]);

  useEffect(() => {
    autoReRender && engineRef.current.reRender();
  }, [editorData]);

  // deprecated
  useEffect(() => {
    scrollSync.current && scrollSync.current.setState({ scrollTop: scrollTop });
  }, [scrollTop]);

  /** 动态设置scale count */
  const handleSetScaleCount = (value: number) => {
    const data = Math.min(maxScaleCount, Math.max(minScaleCount, value));
    setScaleCount(data);
  };

  /** 处理主动数据变化 */
  const handleEditorDataChange = (editorData: TimelineRow[]) => {
    const result = onChange(editorData);
    if (result !== false) {
      engineRef.current.data = editorData;
      autoReRender && engineRef.current.reRender();
    }
  };

  /** 处理光标 */
  const handleSetCursor = (param: { left?: number; time?: number; updateTime?: boolean }) => {
    let { left, time, updateTime = true } = param;
    if (typeof left === 'undefined' && typeof time === 'undefined') return;

    if (typeof time === 'undefined') {
      if (typeof left === 'undefined') left = parserTimeToPixel(time, { startLeft, scale, scaleWidth });
      time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    }

    let result = true;
    if (updateTime) {
      result = engineRef.current.setTime(time);
      autoReRender && engineRef.current.reRender();
    }
    result && setCursorTime(time);
    return result;
  };

  /** 设置scrollLeft */
  const handleDeltaScrollLeft = (delta: number) => {
    // 当超过最大距离时，禁止自动滚动
    const data = scrollSync.current.state.scrollLeft + delta;
    if (data > scaleCount * (scaleWidth - 1) + startLeft - width) return;
    scrollSync.current && scrollSync.current.setState({ scrollLeft: Math.max(scrollSync.current.state.scrollLeft + delta, 0) });
  };

  // 处理运行器相关数据
  useEffect(() => {
    const handleTime = ({ time }) => {
      handleSetCursor({ time, updateTime: false });
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePaused = () => setIsPlaying(false);
    engineRef.current.on('setTimeByTick', handleTime);
    engineRef.current.on('play', handlePlay);
    engineRef.current.on('paused', handlePaused);
  }, []);

  // ref 数据
  useImperativeHandle(ref, () => ({
    get target() {
      return domRef.current;
    },
    get listener() {
      return engineRef.current;
    },
    get isPlaying() {
      return engineRef.current.isPlaying;
    },
    get isPaused() {
      return engineRef.current.isPaused;
    },
    setPlayRate: engineRef.current.setPlayRate.bind(engineRef.current),
    getPlayRate: engineRef.current.getPlayRate.bind(engineRef.current),
    setTime: (time: number) => handleSetCursor({ time }),
    getTime: engineRef.current.getTime.bind(engineRef.current),
    reRender: engineRef.current.reRender.bind(engineRef.current),
    play: (param: Parameters<TimelineState['play']>[0]) => engineRef.current.play({ ...param }),
    pause: engineRef.current.pause.bind(engineRef.current),
    setScrollLeft: (val) => {
      scrollSync.current && scrollSync.current.setState({ scrollLeft: Math.max(val, 0) });
    },
    setScrollTop: (val) => {
      scrollSync.current && scrollSync.current.setState({ scrollTop: Math.max(val, 0) });
    },
  }));

  // 监听timeline区域宽度变化
  useEffect(() => {
    if (areaRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if (!areaRef.current) return;
        setWidth(areaRef.current.getBoundingClientRect().width);
      });
      resizeObserver.observe(areaRef.current!);
      return () => {
        resizeObserver && resizeObserver.disconnect();
      };
    }
  }, []);

  return (
    <div ref={domRef} style={style} className={`${PREFIX} ${disableDrag ? PREFIX + '-disable' : ''}`}>
      <ScrollSync ref={scrollSync}>
        {({ scrollLeft, scrollTop, onScroll }) => (
          <>
            <TimeArea
              {...checkedProps}
              timelineWidth={width}
              disableDrag={disableDrag || isPlaying}
              setCursor={handleSetCursor}
              cursorTime={cursorTime}
              editorData={editorData}
              scaleCount={scaleCount}
              setScaleCount={handleSetScaleCount}
              onScroll={onScroll}
              scrollLeft={scrollLeft}
            />
            <EditArea
              {...checkedProps}
              timelineWidth={width}
              ref={(ref) => ((areaRef.current as any) = ref?.domRef.current)}
              disableDrag={disableDrag || isPlaying}
              editorData={editorData}
              cursorTime={cursorTime}
              scaleCount={scaleCount}
              setScaleCount={handleSetScaleCount}
              scrollTop={scrollTop}
              scrollLeft={scrollLeft}
              setEditorData={handleEditorDataChange}
              deltaScrollLeft={autoScroll && handleDeltaScrollLeft}
              onScroll={(params) => {
                onScroll(params);
                onScrollVertical && onScrollVertical(params);
              }}
            />
            {!hideCursor && (
              <Cursor
                {...checkedProps}
                timelineWidth={width}
                disableDrag={isPlaying}
                scrollLeft={scrollLeft}
                scaleCount={scaleCount}
                setScaleCount={handleSetScaleCount}
                setCursor={handleSetCursor}
                cursorTime={cursorTime}
                editorData={editorData}
                areaRef={areaRef}
                scrollSync={scrollSync}
                deltaScrollLeft={autoScroll && handleDeltaScrollLeft}
              />
            )}
          </>
        )}
      </ScrollSync>
    </div>
  );
});
