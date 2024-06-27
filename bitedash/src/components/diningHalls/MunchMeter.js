import { IgrRadialGaugeModule, RadialGaugeBackingShape } from 'igniteui-react-gauges';
import { IgrRadialGauge, IgrRadialGaugeRange } from 'igniteui-react-gauges';
import { Fragment } from 'react';
import {getFirestore, doc, getDoc, collection} from "@firebase/firestore";
import React, {useState, useEffect} from 'react';
import './Hall.css'


IgrRadialGaugeModule.register();

export default function Meter({hall}){
  const db = getFirestore();
  const [busynessValue, setBusynessValue] = useState(0);

  const busyness = async () => {
    const diningHallName = hall;
    const busynessRef = doc(db, "busyness", diningHallName);

    try {
      const busySnapshot = await getDoc(busynessRef);
    
      if (busySnapshot.exists) {
        const busyness = busySnapshot.data().busyness;
        setBusynessValue(busyness || 0)
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
    
    return busynessValue;
  };
  busyness();

    return ( 
        
        <div style={{height: '100%', width: '100%'}} className='dial'>
            <IgrRadialGauge
                height= '100%'
                width="100%"
                minimumValue={0} value={busynessValue}
                maximumValue={30} interval={10}
                rangeBrushes ="#a4bd29, #FFAC1C, #F86232"
                rangeOutlines="#a4bd29, #FFAC1C, #F86232"  
                scaleStartAngle={180} 
                scaleEndAngle={0}
                tickBrush='#000000'
                tickEndExtent={0.87}
                tickStartExtent={0.83}
                minorTickEndExtent={0.85}
                minorTickStartExtent={0.82}
                minorTickBrush='#36454F'
                backingShape={RadialGaugeBackingShape.Fitted}
                backingStrokeThickness={'1'}
                scaleBrush='transparent'
                backingOuterExtent={'0'}
                labelExtent={0.93}
                labelInterval={5}
                needleEndExtent={.8}
                >
                <IgrRadialGaugeRange name="range1"
                    startValue={0} endValue={10}
                    innerStartExtent={0.10} innerEndExtent={0.10}
                    outerStartExtent={0.85} outerEndExtent={0.85} />
                <IgrRadialGaugeRange name="range2"
                    startValue={10} endValue={20}
                    innerStartExtent={0.10} innerEndExtent={0.10}
                    outerStartExtent={0.85} outerEndExtent={0.85} />
                <IgrRadialGaugeRange name="range3"
                    startValue={20} endValue={30}
                    innerStartExtent={0.10} innerEndExtent={0.10}
                    outerStartExtent={0.85} outerEndExtent={0.85} />
            </IgrRadialGauge>

            <h5 className="meterLabel" style={{transform: ["translateY(-100px)"]}}>Estimated wait</h5>
            <h5 className="meterLabel" style={{transform: ["translateY(-100px)"]}}>(in minutes)</h5>
        </div>
    );
    
}