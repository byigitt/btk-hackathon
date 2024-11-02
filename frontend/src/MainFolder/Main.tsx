import CustomButton from './ButtonFolder/CustomButton';
import './Main.css';
import { useNavigate } from 'react-router-dom';



function MainPage() {
  
  const navigator = useNavigate();

  const handleNavigate = () => {
    navigator('chat'); 
  };
  return (
    <div className="App">
      <div className="gray-column">      
        <div className="button-row">      
        <CustomButton label={'feature 1'} onClick={handleNavigate}></CustomButton>
        <CustomButton label={'feature 2'} onClick={handleNavigate}></CustomButton>
        </div>
        <div className="button-row">      
        <CustomButton label={'feature 3'} onClick={handleNavigate}></CustomButton>
        <CustomButton label={'feature 4'} onClick={handleNavigate}></CustomButton>
        </div>
        <div className="button-row">      
        <CustomButton label={'feature 5'} onClick={handleNavigate}></CustomButton>
        <CustomButton label={'feature 6'} onClick={handleNavigate}></CustomButton>
        </div>
        <div className="button-row">      
        <CustomButton label={'feature 7'} onClick={handleNavigate}></CustomButton>
        <CustomButton label={'feature 8'} onClick={handleNavigate}></CustomButton>
        </div>
      </div>
    </div>
  );
}



export default MainPage;
