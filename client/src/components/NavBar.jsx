import { useLocation } from "wouter";

const NavBar = () => {
  const [location, setLocation] = useLocation();
  
  const navItems = [
    { name: "Home", icon: "bx-home", path: "/app" },
    { name: "Earn", icon: "bx-dollar-circle", path: "/app/earn" },
    { name: "Wallet", icon: "bx-wallet", path: "/app/wallet" },
    { name: "Friends", icon: "bx-group", path: "/app/friends" },
    { name: "Games", icon: "bx-joystick", path: "/app/games" }
  ];
  
  const handleNavigation = (path) => {
    setLocation(path);
  };
  
  return (
    <nav className="bg-wolf-primary px-2 py-3 shadow-lg">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = location === item.path;
          return (
            <div 
              key={item.name}
              className={`nav-item ${isActive ? 'active' : ''} flex flex-col items-center`}
              onClick={() => handleNavigation(item.path)}
            >
              <i className={`bx ${item.icon} text-xl ${isActive ? 'text-wolf-accent' : 'text-wolf-gray'}`}></i>
              <span className={`text-[10px] ${isActive ? 'text-wolf-accent' : 'text-wolf-gray'}`}>{item.name}</span>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default NavBar;
