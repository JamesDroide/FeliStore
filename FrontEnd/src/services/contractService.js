import { ethers } from 'ethers';
import { getContractAddresses } from '../contracts/config.js';
import {
  FELICOIN_ABI,
  LOYALTY_ABI,
  IDENTITY_ABI,
  GOVERNOR_ABI,
  TICKET_ABI
} from '../contracts/abis.js';

// Obtener contrato Felicoin
export const getFelicoinContract = async (signer) => {
  try {
    const network = await signer.provider.getNetwork();
    const addresses = getContractAddresses(network.chainId);

    return new ethers.Contract(
      addresses.FELICOIN,
      FELICOIN_ABI,
      signer
    );
  } catch (error) {
    console.error('Error al obtener contrato Felicoin:', error);
    throw error;
  }
};

// Obtener contrato Loyalty
export const getLoyaltyContract = async (signer) => {
  try {
    const network = await signer.provider.getNetwork();
    const addresses = getContractAddresses(network.chainId);

    return new ethers.Contract(
      addresses.LOYALTY,
      LOYALTY_ABI,
      signer
    );
  } catch (error) {
    console.error('Error al obtener contrato Loyalty:', error);
    throw error;
  }
};

// Obtener contrato Identity
export const getIdentityContract = async (signer) => {
  try {
    const network = await signer.provider.getNetwork();
    const addresses = getContractAddresses(network.chainId);

    return new ethers.Contract(
      addresses.IDENTITY,
      IDENTITY_ABI,
      signer
    );
  } catch (error) {
    console.error('Error al obtener contrato Identity:', error);
    throw error;
  }
};

// Obtener contrato Governor (DAO)
export const getGovernorContract = async (signer) => {
  try {
    const network = await signer.provider.getNetwork();
    const addresses = getContractAddresses(network.chainId);

    return new ethers.Contract(
      addresses.GOVERNOR,
      GOVERNOR_ABI,
      signer
    );
  } catch (error) {
    console.error('Error al obtener contrato Governor:', error);
    throw error;
  }
};

// Obtener contrato Ticket (NFT)
export const getTicketContract = async (signer) => {
  try {
    const network = await signer.provider.getNetwork();
    const addresses = getContractAddresses(network.chainId);

    return new ethers.Contract(
      addresses.TICKET,
      TICKET_ABI,
      signer
    );
  } catch (error) {
    console.error('Error al obtener contrato Ticket:', error);
    throw error;
  }
};

