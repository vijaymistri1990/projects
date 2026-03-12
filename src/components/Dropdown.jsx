import { useRef, useEffect } from "react";

const Dropdown = (props) => {
  const toggleRef = useRef();
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (toggleRef.current && toggleRef.current.contains(e.target)) {
        menuRef.current?.classList.toggle("show");
      } else {
        if (menuRef.current && !menuRef.current.contains(e.target)) {
          menuRef.current.classList.remove("show");
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="dropdown">
      <button
        className={`dropdown-toggle ${props.icon ? "toggle-icon" : "toggle-btn"
          } `}
        ref={toggleRef}
      >
        {props.icon ? <i className={props.icon}></i> : ""}
        {props.badge ? (
          <span className="dropdown-toggle-badge">{props.badge}</span>
        ) : (
          ""
        )}
        {props.customAvatar ? (
          props.customAvatar
        ) : props.avatar ? (
          <div className="dropdown-toggle-avatar">
            <img
              src={props.avatar}
              alt={props.avatar}
              className="dropdown-toggle-avatar-img"
            />
          </div>
        ) : (
          ""
        )}
      </button>
      <div
        className={`dropdown-menu ${props.menuClass ? props.menuClass : ""}`}
        ref={menuRef}
      >
        {props.menu}
      </div>
    </div>
  );
};

export default Dropdown;
