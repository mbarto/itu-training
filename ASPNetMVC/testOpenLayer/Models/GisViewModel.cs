// /////////////////////////////////////////////////////////////////
// 
// testOpenLayer
// Copyright (c) Youbiquitous srls 2017
// 
// Author: Dino Esposito (http://youbiquitous.net)
//  

using System.Collections.Generic;
using testOpenLayer.Business;

namespace testOpenLayer.Models
{
    public class GisViewModel : ItuViewModelBase
    {
        public GisViewModel()
        {
            Points = new List<GisPoint>();
        }

        public IList<GisPoint> Points { get; set; }
    }
}