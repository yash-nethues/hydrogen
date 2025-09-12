import {createContext, useContext, useState, useEffect} from 'react';
import {useIsClient} from '~/hooks/useIsClient';

const WishlistContext = createContext();

export function WishlistProvider({children}) {
  const [wishlist, setWishlist] = useState([]);
  const isClient = useIsClient();

  // console.debug('wishlist data', wishlist);

  useEffect(() => {
    if (isClient) {
      const stored = localStorage.getItem('wishlist');
      if (stored) {
          setWishlist(JSON.parse(stored)); // ✅ no reassignment of `const`
      }
    }
    }, [isClient]);


  useEffect(() => {
    //localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (productId) => {
    if (!wishlist.includes(productId)) {
      setWishlist([...wishlist, productId]);
    }
  };

  const removeFromWishlist = (productId) => {
    setWishlist(wishlist.filter((id) => id !== productId));
  };

  const isInWishlist = (productId) => isClient && wishlist.includes(productId);

  return (
    <WishlistContext.Provider
      value={{wishlist, addToWishlist, removeFromWishlist, isInWishlist}}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
