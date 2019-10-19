import web3 from './web3';
import contractABI from './ABI'
const contractAddress = '0xe866e62e25ED4FbC9a09385e1dDfbE52A2e946E5'
export default new web3.eth.Contract(contractABI, contractAddress);