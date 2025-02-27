import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { localStorageKeys } from 'src/utils/localStorageKeys';
import { isAddress } from 'viem';

const REFERRER_ADDRESS_LENGTH = 42;

const useReferrer = () => {
  const { ref: refParam } = useParams();

  useEffect(() => {

    if (!refParam) return;

    const referrerAddress = refParam.slice(0, REFERRER_ADDRESS_LENGTH);

    if (!isAddress(referrerAddress)) {
      console.error('Invalid Referrer Address. Address should be 42 characters');

      return;
    }

    const referrerFeeBps = refParam.slice(42);
    const formattedReferrerFeeBps =
      referrerFeeBps && Number(referrerFeeBps) > 0 ? referrerFeeBps : null;

    localStorage.setItem(localStorageKeys.REFFERRER_ADDRESS, referrerAddress);

    if (formattedReferrerFeeBps) {
      localStorage.setItem(localStorageKeys.REFERRER_FEE_BPS, formattedReferrerFeeBps);
    } else {
      // In case there is a new referral address without a set fee bps, we remove the old one
      localStorage.removeItem(localStorageKeys.REFERRER_FEE_BPS);
    }
  }, []);
};

export { useReferrer };
