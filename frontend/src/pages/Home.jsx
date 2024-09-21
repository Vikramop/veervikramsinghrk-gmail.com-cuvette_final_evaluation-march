import React, { useRef, useState } from 'react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import './Home.css';

const Home = () => {
  // const feeds = [
  //   {
  //     heading: 'Delicious Pasta Recipes',
  //     description: 'Learn to cook amazing pasta dishes from around the world.',
  //     image:
  //       'https://images.pexels.com/photos/3944377/pexels-photo-3944377.jpeg?auto=compress&cs=tinysrgb&w=600',
  //   },
  //   {
  //     heading: 'Healthy Salads to Keep You Fit',
  //     description: 'Explore these refreshing and nutritious salad ideas.',
  //     image:
  //       'https://images.pexels.com/photos/3944377/pexels-photo-3944377.jpeg?auto=compress&cs=tinysrgb&w=600',
  //   },
  //   {
  //     heading: 'The Art of Pizza Making',
  //     description: 'Master the secrets of making the perfect pizza at home.',
  //     image:
  //       'https://images.pexels.com/photos/3944377/pexels-photo-3944377.jpeg?auto=compress&cs=tinysrgb&w=600',
  //   },
  //   {
  //     heading: 'Top 10 Desserts for Sweet Lovers',
  //     description: 'Indulge in these irresistible dessert recipes.',
  //     image:
  //       'https://images.pexels.com/photos/3944377/pexels-photo-3944377.jpeg?auto=compress&cs=tinysrgb&w=600',
  //   },
  //   {
  //     heading: 'Gourmet Burgers You Can Make at Home',
  //     description: 'Upgrade your burger game with these gourmet ideas.',
  //     image:
  //       'https://images.pexels.com/photos/3944377/pexels-photo-3944377.jpeg?auto=compress&cs=tinysrgb&w=600',
  //   },
  //   {
  //     heading: 'Vegan Dishes Everyone Will Love',
  //     description: 'Delicious vegan meals that even non-vegans will enjoy.',
  //     image:
  //       'https://images.pexels.com/photos/3944377/pexels-photo-3944377.jpeg?auto=compress&cs=tinysrgb&w=600',
  //   },
  // ];

  const feeds = [];
  const filterRef = useRef(null);

  // const feedall = true;
  // const feeds = 0;
  const [showAll, setShowAll] = useState(false);

  // Function to toggle the state
  const handleShowMore = () => {
    setShowAll(!showAll);
  };

  const displayedFeeds = showAll ? 'No feeds' : feeds.slice(0, 4);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - filterRef.current.offsetLeft);
    setScrollLeft(filterRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - filterRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Adjust scroll speed by changing the multiplier
    filterRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div>
      <Header />
      <div className="h-container">
        <div
          className="filter"
          ref={filterRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="box1">All</div>
          <div className="box2">Sports</div>
          <div className="box3">Gaming</div>
          <div className="box4">Foods</div>
          <div className="box5">India</div>
          <div className="box6">World</div>
        </div>

        <div className="filter-sec">
          <h4 className="h4">Top Stories About food</h4>

          <div className={feeds.length > 0 ? 'feed' : 'nofeed'}>
            {feeds.length > 0 ? (
              <div>
                {displayedFeeds.map((feed, index) => (
                  <div
                    key={index}
                    style={{ backgroundImage: `url(${feed.image})` }}
                  >
                    <p className="feed-h">{feed.heading}</p>
                    <p className="feed-para">{feed.description}</p>
                  </div>
                ))}
                {feeds.length > 4 && !showAll && (
                  <button onClick={handleShowMore} className="more-btn">
                    Show More
                  </button>
                )}
                {showAll && feeds.length > 4 && (
                  <button onClick={handleShowMore} className="less-btn">
                    Show Less
                  </button>
                )}
              </div>
            ) : (
              'No stories available'
            )}
          </div>
          {/* <div className={feedall ? '' : 'nofeed'}>
            {feedall ? (
              <div className="feed">
                <div>
                  <p className="feed-h">Heading comes here</p>
                  <p className="feed-para">
                    Inspirational designs, illustrations, and graphic elements
                    from the world’s best designers.
                  </p>
                </div>
                <div>
                  <p className="feed-h">Heading comes here</p>
                  <p className="feed-para">
                    Inspirational designs, illustrations, and graphic elements
                    from the world’s best designers.
                  </p>
                </div>
                <div>
                  <p className="feed-h">Heading comes here</p>
                  <p className="feed-para">
                    Inspirational designs, illustrations, and graphic elements
                    from the world’s best designers.
                  </p>
                </div>
                <div>
                  <p className="feed-h">Heading comes here</p>
                  <p className="feed-para">
                    Inspirational designs, illustrations, and graphic elements
                    from the world’s best designers.
                  </p>
                </div>
              </div>
            ) : (
              'No stories Available'
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Home;
