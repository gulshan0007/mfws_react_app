import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Linking, ImageSourcePropType } from 'react-native';
import iitbLogo from '../assets/iitb.png';
import csLogo from '../assets/cs.png';
import hdfcLogo from '../assets/hdfc.png';
import mcmrLogo from '../assets/mcmbg.png';
import instagramIcon from '../assets/instagram.png';
import bmc from '../assets/bmc.png';
import twitterIcon from '../assets/twitter.png';
import youtubeIcon from '../assets/youtube.png';
import facebookIcon from '../assets/facebook.png';

const ProfileScreen: React.FC = () => {
    const openLink = (url: string) => {
        Linking.openURL(url);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>WHO WE ARE</Text>
            <Text style={styles.paragraph}>
            We are a team of students, faculty, and staff from the Interdisciplinary Programme in Climate Studies (IDPCS) at IIT Bombay, developing an experimental rainfall forecasting and flood monitoring system to help Mumbai adapt to its persistent monsoon flooding. By disseminating near-real-time waterlogging information through a dedicated website portal and the Mumbai Flood App, we aim to provide Mumbaikars with timely and accurate updates. This initiative is part of the HDFC-ERGO IIT Bombay (HE-IITB) Innovation Lab, funded by HDFC ERGO and in collaboration with the MCGM Centre for Municipal Capacity Building and Research (MCMCR).
                {'\n\n'}
                Our hyperlocal rainfall forecasts are derived from global forecasting systems (GFS) and enhanced through AI/ML modeling. The Rainfall tab on the Home page of the web portal and app displays hourly forecasts for the next 24 hours and daily forecasts for the following three days at MCGM automatic weather stations (AWS). For more details on the rainfall forecast, visit the Rainfall tab.
                {'\n\n'}
                Additionally, we are installing nine water-level monitoring stations at various flood-prone hotspots across Mumbai. These stations will provide near-real-time waterlogging updates during the monsoon. For comprehensive information, visit the Water Level tab on the Home Page.

                {'\n\n'}
            We are also in the process of installing nine water-level monitoring stations at different flood-prone hotspots across Mumbai. These stations will display near-real-time waterlogging scenarios during monsoon. For complete details, visit the Water level tab on the Home Page.
                {'\n\n'}
                Join us in this initiative to help Mumbai manage its day-to-day life during monsoon. Report flood in your area using THE form. Help us help you.
            </Text>

            <Text style={styles.header}>Acknowledgements</Text>
            <Text style={styles.paragraph}>
            Installation of the water-level monitoring sensors would not have been possible without the timely assistance, guidance, and wholehearted support from the below-mentioned personnel:
                {'\n\n'}
                1. Ward officers, Executive Engineers, Assistant Engineers, and Junior Engineers of the H West, F South, F North, E and L Wards for granting permissions and helping in identifying flooding hotspots;

                {'\n\n'}
                2. Faculty at the Department of Geography, University of Mumbai for their collaborative efforts in the flood monitoring experiment. We thank the VC, Registrar and the Campus Development Unit of the University of Mumbai for granting space and electricity for installing the canal sensor on MU campus;
                {'\n\n'}
                3. EE and AE Water Works, MCGM staff at Water Works Department, Powai for allowing to use their premises for installing canal sensor on Mithi River; 
                {'\n\n'}
                4. DESLM, BEST for allowing installation of road sensors on BEST poles;
                {'\n\n'}
                5. Chief Engineer and Officials of Customer Care, Electric Supply, BEST for prompt response to electrical connection requests;
                {'\n\n'}


                6.	Secretary, Chairman and Residents of Mandarpan Coop Housing society, RA Kidwai Road Wadala for their cooperation and no objection to installing electric meter in their premises;
                {'\n\n'}

                7.	Mr Omkar Sunil Chavan and the residents of his compound for their cooperation and support for installing canal sensor at Andheri Subway;{'\n\n'}

                8. Officials and Staff at Adani Electricity for prompt response to application request for electric meters.
            </Text>
            
            <View style={styles.section}>
                <Text style={styles.subHeader}>Implementing Partners</Text>
                <View style={styles.partners}>
                    <Image source={iitbLogo} style={styles.partnerImage} />
                    <Image source={csLogo} style={styles.partnerImage} />
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.subHeader}>Sponsoring Partner</Text>
                <View style={styles.partners}>
                    <Image source={hdfcLogo} style={styles.partnerImage} />
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.subHeader}>Project Partners</Text>
                <View style={styles.partners}>
                    <Image source={mcmrLogo} style={styles.partnerImage} />
                </View>
            </View>
            <View style={styles.section}>
                <Text style={styles.subHeader}>Data Source</Text>
                <View style={styles.partners}>
                    <Image source={bmc} style={styles.partnerImage} />
                </View>
            </View>
            <View style={styles.iitTeam}>
                <Text style={styles.subHeader}>IIT Bombay Team</Text>
                <View style={styles.teamList}>
                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/subimal-ghosh-640b46a/')}>Prof. Subimal Ghosh</Text>
                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/raghu-murtugudde-b1438a3b/')}>Prof. Raghu Murtugudde</Text>
                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/aniket-navalkar-4805bb3a')}>Dr. Aniket Navalkar</Text>
                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/mayank-gupta-b32a3225/')}>Dr. Mayank Gupta</Text>
                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/dr-sanghita-basu-73190b60/')}>Dr. Sanghita Basu</Text>
                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/puja-tripathy-82a324173/')}>Puja Tripathy</Text>
                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.facebook.com/archismita.banerjee.5')}>Archismita Banerjee</Text>
                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/sheeba-sekharan/')}>Sheeba Sekharan</Text>
                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/shrabani-tripathy-37979310b/')}>Dr. Shrabani Tripathy</Text>


                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/sautrik-chaudhuri-094064141/')}>Sautrik Chaudhuri</Text>


                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/jisha-joseph-33a5b7aa/"')}>Dr. Jisha Joseph</Text>

                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/deepaksilaych/')}>Deepak Silaych</Text>
                    <Text style={[styles.teamMember, styles.link]} onPress={() => Linking.openURL('https://www.linkedin.com/in/gulshan-kumar-69b54b25b/')}>Gulshan Kumar</Text>
                </View>
                <Text style={styles.teamNote}>
                    Website & App developed by{'\n'}IIT Bombay students, Deepak{'\n'}Silaych & Gulshan Kumar
                    {'\n'}
                </Text>
            </View>
            <View style={styles.socialMediaIcons}>
                <TouchableOpacity onPress={() => Linking.openURL('https://x.com/ClimateIITB')}>
                    <Image source={twitterIcon} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/IDPinClimateStudiesIITBombay')}>
                    <Image source={youtubeIcon} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/IITBclimate')}>
                    <Image source={facebookIcon} style={styles.icon} />
                </TouchableOpacity>
            </View>
            <Text >
                    
                    {'\n'}{'\n'}{'\n'}{'\n'}
                </Text>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDF0F2',
        padding: 20,
    },
    paragraph: {
        fontSize: 16,
        marginBottom: 20,
        color: 'black',
        fontStyle: 'italic',
    },
    header: {
        textAlign: 'center',
        backgroundColor: '#F6B800',
        paddingVertical: 10,
        fontWeight: 'bold',
        color: 'black',
        fontSize: 18,
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    subHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: 'black',
        display: 'flex', // Ensure the parent container is a flex container
        alignItems: 'center',
    },
    partners: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
    },
    partnerImage: {
        height: 100,
        width: 100,
        resizeMode: 'contain',
    },
    iitTeam: {
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 5,
        marginBottom: 20,
    },
    teamList: {
        marginBottom: 10,
    },
    teamMember: {
        fontSize: 16,
        marginBottom: 5,
        color: 'black',
    },
    link: {
        textDecorationLine: 'underline', // Underline the text
        color: '#007bff', // Optionally change the color to a clickable style
    },
    teamNote: {
        fontSize: 14,
        color: 'black',
        fontStyle: 'italic',
    },
    socialMediaIcons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    icon: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
});

export default ProfileScreen;
