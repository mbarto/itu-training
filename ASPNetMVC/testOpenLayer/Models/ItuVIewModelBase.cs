// /////////////////////////////////////////////////////////////////
// 
// testOpenLayer
// Copyright (c) Youbiquitous srls 2017
// 
// Author: Dino Esposito (http://youbiquitous.net)
//  

using testOpenLayer.Common;

namespace testOpenLayer.Models
{
    public class ItuViewModelBase
    {
        public ItuViewModelBase()
        {
            Title = "ITU GIS View";
            CopyrightNotes = "ITU (c) 2018";
            Settings = ItuGisApplication.Settings;
        }

        public string Title { get; set; }
        public string CopyrightNotes { get; set; }
        public ItuSettings Settings { get; set; }
    }
}