import InstanceCard from "./InstanceCard";
import catgif from './assets/cat_wave.gif'
import Navbar from './Navbar'

const Home = () => {
    
    


    return (
        <div className="content css-selector">

            <div className="instance-container glass">
                <img className="m-2 ms-3 cat-wave" src={catgif} />
                <p className="title mt-3">Laipni lūgts sistēmā "Erudīts"!</p>

            <div className="container">
                <div className="row">
                    <InstanceCard/>
                    <InstanceCard/>
                    <InstanceCard/>
                </div>
            </div>

            </div>
            <Navbar/>
        </div>
    
    );
}

export default Home;
