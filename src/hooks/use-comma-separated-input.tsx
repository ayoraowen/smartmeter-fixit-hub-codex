import { useState } from "react";

export function useCommaSeparatedInput(initial = "") {
  const [value, setValue] = useState(initial);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    const v = e.target.value;

    // --- Prevent SPACE starting a new blank item ---
    if (e.key === " ") {
      if (v.endsWith(",")) {
        e.preventDefault();
        return;
      }
    }

    // --- Prevent DOUBLE COMMAS or BLANK COMMAS ---
    if (e.key === ",") {
      // block ",,"
      if (v.endsWith(",")) {
        e.preventDefault();
        return;
      }

      // block "item, "
      if (v.endsWith(", ")) {
        e.preventDefault();
        return;
      }

      // block comma after blank space
      if (/,\s*$/.test(v)) {
        e.preventDefault();
        return;
      }
    }
  };

  const toArray = () =>
    value
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

  return {
    value,
    setValue,
    handleChange,
    handleKeyDown,
    toArray,
  };
}
