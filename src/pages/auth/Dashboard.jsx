import React, { useEffect } from 'react';
import { LegacyCard, Page } from '@shopify/polaris';
const AnyReactComponent = ({ text }) => <div>{text}</div>;
const Dashboard = ({ simulatorQueryData }) => {

  // console.log('simulatorQueryData==============', simulatorQueryData);
  useEffect(() => {
    if (Object.keys(simulatorQueryData).length) {
      const ifameData = document.getElementById("iframeId")
      const lat = simulatorQueryData.latitude;
      const lon = simulatorQueryData.longtitude;
      ifameData.src = `https://maps.google.com/maps?q=${lat},${lon}&hl=es;&output=embed`
    }
  })

  return (
    <div className='query'>
        {simulatorQueryData && Object.keys(simulatorQueryData).length ? <LegacyCard>
          <div className='p-2 row my-2 '>

            <div className=' col-sm-3'>
              <div>
                <div className='d-flex align-items-center'>
                  <span>Query :</span>
                  <h6 className='p-1 ' style={{ fontWeight: '600' }}>  {simulatorQueryData.query}</h6>
                </div>
                <div className='d-flex'>
                  <span>Local :&nbsp;</span>
                  <span>{simulatorQueryData.locale}</span>
                </div>
                <div className=''>
                  <span>User Location: {simulatorQueryData.location}</span>
                  <p>[{simulatorQueryData.latitude}, {simulatorQueryData.longtitude}]</p>
                </div>
              </div>
            </div>
            <div className='col-sm-6'>
              <div>
                <iframe id="iframeId" className='map'></iframe>
              </div>
            </div>
            <div className='col-sm-3'>

            </div>

          </div>
        </LegacyCard> : <></>}
    </div>

  )
}

export default Dashboard