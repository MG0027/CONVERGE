import React from 'react';
import { Button } from '../ui/button';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '../../store/authSlice';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const handleLogout = () => {
    dispatch(signOut());
    localStorage.removeItem("token");    
    navigate('/login');
  };

  return (
    <div className='p-4 flex justify-between items-center'>
      <h1
        className='text-2xl font-extrabold tracking-wide cursor-pointer'
        onClick={() => navigate('/')}
      >
        CONVERGE
      </h1>
      <div className='flex gap-5'>
        {isLoggedIn && (
          <Button variant='ghost' onClick={handleLogout}>
            Log Out
          </Button>
        )}
      </div>
    </div>
  );
}

export default Header;
