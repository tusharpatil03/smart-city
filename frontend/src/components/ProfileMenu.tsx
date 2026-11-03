import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../i18n";

const getInitials = (name: string | undefined): string => {
  if (!name) {
    return "U";
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "U";
};

export function ProfileMenu() {
  const { logout, user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const userRole = user?.role;
  const isAdmin = userRole === "admin";

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!user) {
    return null;
  }

  const handleLogout = (): void => {
    setIsOpen(false);
    logout();
    navigate("/authority/login", { replace: true });
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="profile-menu-dropdown"
        aria-label={t("navbar.profile")}
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="profile-menu__avatar">{getInitials(user.name)}</span>
      </button>

      {isOpen ? (
        <div className="profile-menu__dropdown" id="profile-menu-dropdown" role="menu">
          <div className="profile-menu__header">
            <strong>{user.name}</strong>
            <span>{userRole ?? "user"}</span>
          </div>

          <NavLink to="/profile" className="profile-menu__item" role="menuitem" onClick={() => setIsOpen(false)}>
            {t("navbar.myProfile")}
          </NavLink>

          {isAdmin ? (
            <NavLink to="/admin" className="profile-menu__item" role="menuitem" onClick={() => setIsOpen(false)}>
              {t("navbar.adminPanel")}
            </NavLink>
          ) : null}

          <button type="button" className="profile-menu__item profile-menu__item--danger" onClick={handleLogout}>
            {t("auth.logout")}
          </button>
        </div>
      ) : null}
    </div>
  );
}