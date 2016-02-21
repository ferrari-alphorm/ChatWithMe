--
-- Table structure for table `rooms`
--

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `roomName` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roomName` (`roomName`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `rooms-messages`
--

DROP TABLE IF EXISTS `rooms-messages`;
CREATE TABLE IF NOT EXISTS `rooms-messages` (
  `id` int(11) NOT NULL,
  `this_id` int(11) NOT NULL,
  `username` varchar(80) NOT NULL,
  `message` varchar(255) NOT NULL,
  `date` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
