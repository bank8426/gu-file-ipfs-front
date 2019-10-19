import React, { useState } from 'react';
import web3 from './web3';
import ipfs from './ipfs';
import storehash from './storehash';
import { Button,Box } from 'rimble-ui';
import styled from 'styled-components';

const Grid = styled(Box)`
  display: grid;
`

export default function App() {
  const [ipfsHash,setIpfsHash] = useState(null)
  const [buffer,setBuffer] = useState('')
  const [ethAddress,setEthAddress] = useState('')
  const [transactionHash,setTransactionHash] = useState('')
  const [txReceipt,setTxReceipt] = useState('')
  //Take file input from user
  const captureFile =(event) => {        
    event.stopPropagation()        
    event.preventDefault()        
    const file = event.target.files[0]        
    let reader = new window.FileReader()        
    reader.readAsArrayBuffer(file)        
    reader.onloadend = () => convertToBuffer(reader)      
  };

  //Convert the file to buffer to store on IPFS 
  const convertToBuffer = async(reader) => {      
    //file is converted to a buffer for upload to IPFS        
    const buffer = await Buffer.from(reader.result);      
    //set this buffer-using es6 syntax        
    setBuffer(buffer);    
  };

  //ES6 async 
  const onClick = async () => {
    try{        
      // this.setState({blockNumber:"waiting.."});        
      // this.setState({gasUsed:"waiting..."});
      await web3.eth.getTransactionReceipt(transactionHash, (err, txReceipt)=>{          
        console.log(err,txReceipt);          
        setTxReceipt({txReceipt});        
      });      
    }
    catch(error){      
      console.log(error);    
    }
  }

  const onSubmit = async (event) => {      
    event.preventDefault();
    //bring in user's metamask account address      
    const accounts = await web3.eth.getAccounts();    
    //obtain contract address from storehash.js      
    const ethAddress= await storehash.options.address;      
    setEthAddress(ethAddress);    
    //save document to IPFS,return its hash#, and set hash# to state      
    await ipfs.add(buffer, (err, ipfsHashResult) => {        
      console.log(err,ipfsHashResult);       
      //set State by setting ipfsHash to ipfsHash[0].hash        
      setIpfsHash( ipfsHashResult[0].hash );        
      // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract        
      //return the transaction hash from the ethereum contract  
      console.log(storehash.methods)    
      console.log(ipfsHash)  
      storehash.methods.setHash(ipfsHashResult[0].hash).send({          
        from: accounts[0]        
      }, (error, transactionHash) => {          
        console.log(transactionHash);          
        setTransactionHash(transactionHash);       
      });      
    })    
  };

  return (
    <div className="App">          
      <header className="App-header">            
        <h1>Ethereum and IPFS using Infura</h1>          
      </header>
      <hr/>
      <Grid>          
        <h3> Choose file to send to IPFS </h3>          
        <form onSubmit={onSubmit}>            
          <input type = "file" onChange = {captureFile} />             
          <Button type="submit">Send it</Button>          
        </form>
        <hr/> 
        <Button onClick = {onClick}> Get Transaction Receipt </Button> 
        <hr/>  
        <table>                
          <thead>                  
            <tr>                    
              <th>Tx Receipt Category</th>                    
              <th> </th>                    
              <th>Values</th>                  
            </tr>                
          </thead>
          <tbody>                  
            <tr>                    
              <td>IPFS Hash stored on Ethereum</td>                    
              <td> : </td>                    
              <td>{ipfsHash}</td>                  
            </tr>                  
            <tr>                    
              <td>Ethereum Contract Address</td>                    
              <td> : </td>                    
              <td>{ethAddress}</td>                  
            </tr>                  
            <tr>                    
              <td>Tx # </td>                    
              <td> : </td>                    
              <td>{transactionHash}</td>                  
            </tr>                
          </tbody>            
        </table>        
      </Grid>     
    </div>
  )
}
