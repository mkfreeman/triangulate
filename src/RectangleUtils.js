

const RectangleUtils = {

    // Get a split location between minval and maxval.
    // Currently, this identifies a random split between 40 and 60 percent
    // of the way between the min and max to give the rectangular subdivision
    // a little more random appearance.
    getSplitLocation: function(minval, maxval) {
        return minval + (.4+Math.random()*.2)*(maxval-minval);
    },
    
    // Swap sites i and j in the sites list
    swapSites: function(sites, i,j) {
        let tmpSite = sites[i];
        sites[i] = sites[j];
        sites[j] = tmpSite;
    },

    // Given a list of sites (between firstSite and lastSites in the sites list) and a current
    // rectangle defined by [minx, miny, maxx, maxy], create rectangles covering the current
    // rectangle that each contain exactly one site and fill those into the appropriate location
    // in the rectangles object. 
    // 
    // Notes: * This is called recursively with the base case being a list containing a single site.
    //        * The input sites list gets constantly reordered in this process. In the result,
    //          the site in sites[i] matches the rectangle in rectangles[i], but the that doesn't 
    //          correspond to the position of sites[i] in the original input.
    fillRectangles: function(sites,minx, miny, maxx, maxy, firstSite, lastSite, rectangles) {
        // Base Case: this rectangle only contains one site so record the rectangle
        // in the rectangles array        
        if (lastSite <= firstSite+1)
        {
            rectangles[firstSite] = new Array(4);
            rectangles[firstSite][0] = [minx, miny];
            rectangles[firstSite][1] = [minx, maxy];
            rectangles[firstSite][2] = [maxx, maxy];
            rectangles[firstSite][3] = [maxx, miny];
            return;
        }
        
        // Otherwise, subdivide into two rectangles
        
        // first get the range of the actual voronoi sites
        let minsitex = maxx+1;
        let minsitey = maxy+1;
        let maxsitex = minx-1;
        let maxsitey = miny-1;
        for (let i = firstSite; i < lastSite; i++) {
            if (minsitex > sites[i][0]) {
                minsitex = sites[i][0];
            }
            if (minsitey > sites[i][1]) {
                minsitey = sites[i][1];
            }
            if (maxsitex < sites[i][0]) {
                maxsitex = sites[i][0];
            }
            if (maxsitey < sites[i][1]) {
                maxsitey = sites[i][1];
            }
        }

        let leftPos = firstSite;
        let rightPos = lastSite - 1;
        
        // Subdivide along the axis involving a larger variance in the sites.
        if ((maxsitex - minsitex) > (maxsitey - minsitey)) {
            let split = RectangleUtils.getSplitLocation(minsitex,maxsitex);
            // Group the sites inplace so that sites below / above the split are together.
            while (leftPos < rightPos) {
                if (sites[leftPos][0] < split) {
                    leftPos = leftPos + 1;
                } else if (sites[rightPos][0] >= split) {
                    rightPos = rightPos - 1;
                } else {
                    RectangleUtils.swapSites(sites, leftPos, rightPos);
                }
            }
            // Recursively process the subdivided rectangles.
            RectangleUtils.fillRectangles(sites, minx, miny, split, maxy, firstSite, rightPos, rectangles);
            RectangleUtils.fillRectangles(sites, split, miny, maxx, maxy, rightPos, lastSite, rectangles);
        } else {
            // Same as above but for a split along the second/y coordinate
            let split = RectangleUtils.getSplitLocation(minsitey,maxsitey);
            while (leftPos < rightPos) {
                if (sites[leftPos][1] < split) {
                    leftPos = leftPos + 1;
                } else if (sites[rightPos][1] >= split) {
                    rightPos = rightPos - 1;
                } else {
                    RectangleUtils.swapSites(sites,leftPos, rightPos);
                }
            }
            RectangleUtils.fillRectangles(sites, minx, miny, maxx, split, firstSite, rightPos, rectangles);
            RectangleUtils.fillRectangles(sites, minx, split, maxx, maxy, rightPos, lastSite, rectangles);
        }
    }
}

export default RectangleUtils;