import { useContext } from 'react';
import { RomContext } from '../rom-mod/RomProvider';
import { FnVoid, OnChange } from '../types/common';

type ButtonCtrlProps = {
  _reapplySelect: FnVoid;
  changeLevel: OnChange<HTMLSelectElement>;
  chunkTest: OnChange<HTMLInputElement>;
  deleteSelected: FnVoid;
  exportClicked: FnVoid;
  fileOpened: OnChange<HTMLInputElement>;
  inputLoaded: boolean;
  loading: boolean;
  replaceAllChunks: FnVoid;
  redo: FnVoid;
  rerenderPages: (noCache?: boolean) => void;
  saveLevel: FnVoid;
  tileTest: OnChange<HTMLInputElement>;
  undo: FnVoid;
};

export default function ButtonControls(props: ButtonCtrlProps) {
  /**
   * Context/Const
   */
  const { romData } = useContext(RomContext);
  const disableButton = props.loading || !props.inputLoaded;

  /**
   * Handles
   */
  const handleRerender = () => {
    props.rerenderPages(true);
  };

  /**
   * Render
   */
  return (
    <section id="buttons">
      <button onClick={handleRerender} disabled={disableButton}>
        Re-render
      </button>
      <button onClick={props.replaceAllChunks} disabled={disableButton}>
        Replace Objects
      </button>
      <button onClick={props._reapplySelect} disabled={disableButton}>
        Reapply Select
      </button>
      <button onClick={props.saveLevel} disabled={disableButton}>
        Save Level
      </button>
      <button onClick={props.exportClicked} disabled={disableButton}>
        Export
      </button>
      <button onClick={props.deleteSelected} disabled={disableButton}>
        Delete
      </button>
      <button onClick={props.undo} disabled={disableButton}>
        Undo
      </button>
      <button onClick={props.redo} disabled={disableButton}>
        Redo
      </button>
      <input
        type="text"
        disabled={disableButton}
        style={{ width: 70 }}
        placeholder="Tilecode"
        onChange={props.tileTest}
      />
      <input
        type="text"
        disabled={disableButton}
        style={{ width: 70 }}
        placeholder="Chunkcode"
        onChange={props.chunkTest}
      />

      <select
        disabled={disableButton}
        id="levelSelectSelector"
        onChange={props.changeLevel}
      >
        {romData
          ? romData.levels.map((le, i) => (
              <option value={le.levelId} key={`leveloption-${i}`}>
                {le.levelTitle}
              </option>
            ))
          : null}
      </select>
      {!props.inputLoaded ? (
        <input
          type="file"
          onInput={props.fileOpened}
          disabled={props.loading}
        />
      ) : null}
    </section>
  );
}
