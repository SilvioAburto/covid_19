import React, {Component} from 'react';
import {Card, CardContent, Grid, NativeSelect, FormControl} from '@material-ui/core';
import Countup from 'react-countup';
import './CovidTracker.css';
import './CovidMap.css';
import { Map, Tooltip, TileLayer, CircleMarker } from "react-leaflet";
import {countriesCoordinates} from './countries_lat_long';


export default class CovidTracker extends Component {
    constructor(props){
        super(props);
        this.state ={
            msg:"",
            dataCards:{},
            dataGlobal:{},
            mapValueType:"Confirmed",
            dataSummaryCountry:{},
            countriesNames:{},
            country:'',
            mapZoom:1.5,
            isLoaded:false,
            isLoadedCountry:false
        };
    }


    async componentDidMount() {
        //alternate api
        //https://corona.lmao.ninja/v2/countries 
        await fetch("https://api.covid19api.com/summary")
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              isLoaded: true,
              dataCards: result.Global,
              dataGlobal: result.Global,
              dataSummaryCountry: result.Countries
            });
          },
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        )

        await fetch("https://api.covid19api.com/countries")
        .then(res => res.json())
        .then(
          (countriesResult) => {
            var countriesList = countriesResult.map((country) => country.Country);
            var countriesNamesOrdered = countriesList.sort();
            this.setState({
              isLoadedCountry: true,
              countriesNames: countriesNamesOrdered,
            });
          },
          (errorCountry) => {
            this.setState({
              isLoadedCountry: true,
              errorCountry
            });
          }
        )
        
        this.mapZoom();
      }

      mapZoom = () => {
        let screenSize = window.screen.width;
        if(screenSize <= 800){
            this.setState({
                mapZoom:0.5
            })
        }
        else{
            this.setState({
                mapZoom:1.5
            })
        }
      }

      selectedValueTypes = (type) => {
        if(type === 'active'){
            this.setState({
                mapValueType:"Active"
            })
        }
        else if(type === 'confirmed'){
            this.setState({
                mapValueType:"Confirmed"
            })
        }
        else if(type === 'recovered'){
            this.setState({
                mapValueType:"Recovered"
            })
        }
        else if(type === 'deaths'){
            this.setState({
                mapValueType:"Deaths"
            })
        }
        else{return;}
      }

      dataSummary = (countryName,d1,d2) => {
        console.log(countryName)
        if(countryName === 'Global'){
            this.setState({
                dataCards:d1
            })
        }
    
        else{
            let d3 = d2.filter(function(el){
                return el.Country === countryName
            });
            if(d3 === undefined || d3.length === 0){
                return;
            }
            else{
                this.setState({
                    dataCards:d3[0]
                })
            }
        }
    }
   
    render(){
            const {error, mapZoom,dataGlobal,dataCards,mapValueType,dataSummaryCountry,isLoaded,isLoadedCountry, countriesNames, errorCountry} = this.state;
            const mapDataCount = addCoordinatesToData(dataSummaryCountry);
            console.log(mapZoom)
            console.log(window.screen.width)
            //console.log(mapDataCount)
            //console.log(mapDataCount.length)
            if(error | errorCountry){
                return <div>Error" {error.message}</div>
            } 
            else if(!isLoaded | !isLoadedCountry){
                return <div>Loading...</div>
            } 
            else if (mapDataCount.length === 0){
                return <div>Loading...</div>
            }
            else{      
                return(
                    <div className="dashboard">
                        <div className = "dashTitle">COVID-19</div>
                        <FormControl className = "countryDropdown">
                            Select Country
                            <NativeSelect defaultValue =""  onChange={(e) => this.dataSummary(e.target.value, dataGlobal, dataSummaryCountry)} >
                                <option value ="Global">Global</option>
                                {countriesNames.map((country, i) => <option key={i}value={country}>{country}</option>)}
                            </NativeSelect>
                        </FormControl>
                        <div className = "cardsContainer">
                            <Grid container spacing={2} justify="center" >
                                <Grid item xs={6} md={2} className='cardTotal'>
                                    <Card onClick={()=>this.selectedValueTypes('confirmed')}>
                                        <CardContent>
                                            <div className = "confirmedTitle">Confirmed</div>
                                            <div className = "count">
                                                <Countup 
                                                    start={0} 
                                                    end={dataCards.TotalConfirmed + dataCards.NewConfirmed} 
                                                    duration={1} 
                                                    separator="," />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} md={2} component={Card} className='cardActive'>
                                    <Card onClick={()=>this.selectedValueTypes('active')}>
                                        <CardContent>
                                            <div className = "activeTitle">Active</div>
                                            <div className = "count">
                                                <Countup 
                                                    start = {0} 
                                                    end={(dataCards.TotalConfirmed + dataCards.NewConfirmed) - (dataCards.TotalRecovered + dataCards.NewRecovered) -(dataCards.TotalDeaths + dataCards.NewDeaths)} 
                                                    duration={1} 
                                                    separator=","/>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} md={2} component={Card} className='cardRecovered'>
                                    <Card onClick={()=>this.selectedValueTypes('recovered')}>
                                        <CardContent>
                                            <div className = "deathsTitle">Recovered</div>
                                            <div className = "count">
                                                <Countup 
                                                    start = {0} 
                                                    end={(dataCards.TotalRecovered + dataCards.NewRecovered)}  
                                                    duration={1} 
                                                    separator=","/>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6} md={2} component={Card} className='cardDeaths'>
                                    <Card onClick={()=>this.selectedValueTypes('deaths')}>
                                        <CardContent>
                                            <div className = "deathsTitle">Deaths</div>
                                            <div className = "count">
                                                <Countup 
                                                    start = {0} 
                                                    end={(dataCards.TotalDeaths + dataCards.NewDeaths)}  
                                                    duration={1} 
                                                    separator=","/>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>    
                        </div>
                        <div className="covidMap">
                        {/* for phone use 0.5 for large screens use 1.5 */}
                            <div className ="caseType">{"Case type: " + mapValueType}</div>
                            <Map center={[20, 10]} zoom={mapZoom}>      
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                                        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors' />
                                {mapDataCount.map((country, k) => {
                                    return (
                                    <CircleMarker
                                        key = {k}
                                        center={[country["coordinates"][0], country["coordinates"][1]]}
                                        radius={Math.log10(country[mapValueType])*3}
                                        color= {countryColor(mapValueType)}
                                        fillOpacity={0.6}
                                        stroke={true}
                                    >
                                    <Tooltip direction="right" offset={[-8, -2]} opacity={1}>
                                        <span>{country["Country"] + ": " + mapValueType + " " + country[mapValueType]}</span>
                                    </Tooltip>                      
                                    </CircleMarker>)
                                })
                                }
                                </Map>
                        </div>
                        <div className = "footer"><b>App made by: </b><a href="https://silvioaburto.github.io">Silvio Ortiz</a>
                        &nbsp;&nbsp;<b>Suggestions/issues: </b><a href="mailto:silviortiz93@gmail.com">HERE</a>
                        &nbsp;&nbsp;<b>Data source:</b><a href="https://api.covid19api.com/">HERE</a>

                        
                        </div>
                </div>


                    )
                }   
            }
}

const filterCoordinates = (coorArray, countryCode) => {
    let code = coorArray.filter(function(el){
        return el.country_code === countryCode 
    });
    //console.log(Num)
    if(code === undefined || code.length === 0){
        return;
    }
    else{
        return code[0].latlng
    }
}

const countryColor = (c) => {
    return c === 'Active' ? '#51be57cc': 
      c === 'Confirmed'? '#e9a932':
      c === 'Deaths' ? '#ff7671':
      c === 'Recovered' ? '#6ba9fa': 
      'gray';
  }


const addCoordinatesToData = (countryCount) => {
    const coordinates = countriesCoordinates();
    if(coordinates.length >0 ){
        var dataTransformed = [];
        for(let i=0; i < countryCount.length; i++){
            var obj = {};
            let countryCode = countryCount[i].CountryCode 
            let coor = filterCoordinates(coordinates, countryCode);
            if(typeof coor != 'undefined'){
                obj.Country = countryCount[i].Country
                obj.Confirmed = countryCount[i].NewConfirmed + countryCount[i].TotalConfirmed
                obj.Active = (countryCount[i].NewConfirmed + countryCount[i].TotalConfirmed) - (countryCount[i].NewDeaths + countryCount[i].TotalDeaths) - (countryCount[i].NewRecovered + countryCount[i].TotalRecovered)
                obj.Deaths = countryCount[i].NewDeaths + countryCount[i].TotalDeaths
                obj.Recovered = countryCount[i].NewRecovered + countryCount[i].TotalRecovered
                obj.Date = countryCount[i].Date
                obj.coordinates = coor
                if(obj.Confirmed === 0){
                    continue
                }
                dataTransformed.push(obj)
            }
        }
        
        return dataTransformed
    }
}


