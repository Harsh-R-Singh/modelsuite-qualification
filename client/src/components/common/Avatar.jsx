import { useState } from 'react';

const Avatar = ({ src, name = '', role = 'talent', className = '', style = {} }) => {
  const [imgError, setImgError] = useState(false);
  const initial = name ? name.charAt(0).toUpperCase() : (role.toLowerCase() === 'admin' ? 'A' : 'T');
  
  const baseClass = role.toLowerCase() === 'admin' ? 'avatar-admin' : 'avatar-talent';
  // If className already includes sizing, we just use it, otherwise default to w-8 h-8
  const sizingClass = className.includes('w-') ? '' : 'w-8 h-8 text-[12px]';
  const defaultClasses = `rounded-full flex items-center justify-center font-bold text-white shrink-0 ${baseClass} ${sizingClass} ${className}`.trim();

  if (src && !imgError) {
    return (
      <img 
        src={src} 
        alt={name || 'Avatar'} 
        onError={() => setImgError(true)}
        className={`object-cover rounded-full shrink-0 ${sizingClass} ${className}`.trim()}
        style={style} 
      />
    );
  }

  return (
    <div className={defaultClasses} style={style}>
      {initial}
    </div>
  );
};

export default Avatar;
