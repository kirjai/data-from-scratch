import { useEffect, useRef, useState } from "react";
import { useOutsideClick } from "rooks";

/**
 * number of samples?
 *
 * 1. Commonly used columns
 * 1.1 name (first + last)
 * 1.2 age
 * 1.3 dob
 * 1.4 email (first.last@emaildomain)
 * 1.5 address (gb addresses)
 *
 * 2. numerical
 * 2.1 gamma distrbution
 * 2.2 uniform distribution
 * 2.3 normal distribution
 * 2.4 random distribution
 *
 * 3. categorical
 * 3.1 how many categories?
 * 3.1.1 name
 * 3.1.2 probability
 *
 *
 * - decimal places? or signficant, how many?
 * - for each correlated column:
 *  - gradient
 *  - c
 *  - loc
 */

type HeaderProps = {
  name: string;
  setName: (name: string) => void;
};

export function Header(props: HeaderProps) {
  const { name, setName } = props;
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
            className="input w-full"
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
          ✏️ <span className="ml-2">{name}</span>
        </button>
      )}
    </div>
  );
}
