import { useEffect, useRef, useState } from "react";
import { useOutsideClick } from "rooks";
import type { ColumnType } from "~/utils/ColumnProvider";

/**
 * 2. numerical
 * 2.1 gamma distrbution
 *  - min, standard deviation
 * 2.2 uniform distribution
 *  - min, max
 * 2.3 normal distribution
 *  - mean, standard deviation
 *
 *
 * 3. categorical
 * 3.1 how many categories?
 * 3.1.1 name
 * 3.1.2 probability
 */

type HeaderProps = {
  name: string;
  setName: (name: string) => void;
  type?: ColumnType;
};

export function Header(props: HeaderProps) {
  const { name, setName, type } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(() => name);
  const [isBeingEdited, setIsBeingEdited] = useState(false);

  useEffect(() => {
    setInputValue(name);
  }, [name]);

  const saveAndClose = () => {
    setName(inputValue);
    setIsBeingEdited(false);
  };

  useOutsideClick(containerRef, () => {
    saveAndClose();
  });

  useEffect(() => {
    if (isBeingEdited && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isBeingEdited]);

  return (
    <div ref={containerRef}>
      {isBeingEdited ? (
        <form onSubmit={saveAndClose}>
          <input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            className="input w-full invalid:input-bordered invalid:input-error"
            ref={inputRef}
            required
          />

          <button type="submit" className="hidden">
            Submit
          </button>
        </form>
      ) : (
        <button
          className="w-full text-left text-base"
          onClick={() => setIsBeingEdited(true)}
        >
          <span className="flex flex-col">
            <span>
              ✏️ <span className="ml-2">{name}</span>
            </span>
            {type ? (
              <span className="text-xs opacity-50 font-light">
                (type: {type})
              </span>
            ) : null}
          </span>
        </button>
      )}
    </div>
  );
}
