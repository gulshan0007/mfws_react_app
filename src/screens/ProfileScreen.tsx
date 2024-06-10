import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Linking, ImageSourcePropType } from 'react-native';
import iitbLogo from '../assets/iitb.png';
import csLogo from '../assets/cs.png';
import hdfcLogo from '../assets/hdfc.png';
import mcmrLogo from '../assets/mcmbg.png';
import instagramIcon from '../assets/instagram.png';
import twitterIcon from '../assets/twitter.png';
import youtubeIcon from '../assets/youtube.png';
import facebookIcon from '../assets/facebook.png';

const ProfileScreen: React.FC = () => {
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.paragraph}>
                {'\n\n'}
                A group of students, faculty, and staff from the Interdisciplinary Programme in Climate Studies (IDPCS) at IIT Bombay is developing an experimental rainfall forecasting system and a flood monitoring system to help Mumbai adapt to its persistent flood situation every monsoon, by dissemination of near-real-time water logging information to Mumbaikars using this website portal and Mumbai Flood App developed by our team. This is an HDFC-ERGO IIT Bombay (HE-IITB) Innovation Lab initiative funded by HDFC ERGO, and in collaboration with MCGM Centre for Municipal Capacity Building and Research (MCMCR), Adani Electricity Mumbai Limited, and Brihanmumbai Electricity Supply and Transport Undertaking (BEST).
                {'\n\n'}
                The hyperlocal rainfall forecasts are based on global forecasting systems (GFS) and AI/ML modeling. The widgets in the 'Rainfall' tab on the Home page in this web portal and app display forecasts at hourly intervals for 24 hours along with daily forecasts for the next three days, at the MCGM automatic weathers stations (AWS). For the rainfall forecast widget, visit the Rainfall tab on the Home page. 
                {'\n\n'}
                We are also in the process of installing nine water-level monitoring stations at different flood-prone hotspots across Mumbai. These stations will display near-real-time waterlogging scenarios during monsoon. For complete details, visit the Water level tab on the Home Page.
                {'\n\n'}
                Join us in this initiative to help Mumbai manage its day-to-day life during monsoon. Report flood in your area using the form. Help us help you.
            </Text>
            <Text style={styles.header}>WHO WE ARE</Text>
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
            <View style={styles.iitTeam}>
                <Text style={styles.subHeader}>IIT Bombay Team</Text>
                <View style={styles.teamList}>
                    <Text style={styles.teamMember}>Prof. Subimal Ghosh</Text>
                    <Text style={styles.teamMember}>Prof. Raghu Murtugudde</Text>
                    <Text style={styles.teamMember}>Dr. Aniket Navalkar</Text>
                    <Text style={styles.teamMember}>Dr. Mayank Gupta</Text>
                    <Text style={styles.teamMember}>Dr. Sanghita Basu</Text>
                    <Text style={styles.teamMember}>Puja Tripathy</Text>
                </View>
                <Text style={styles.teamNote}>
                    Website & App developed by{'\n'}IIT Bombay students, Deepak{'\n'}Silaych & Gulshan Kumar
                    {'\n\n'}
                </Text>
            </View>
            <View style={styles.socialMediaIcons}>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com')}>
                    <Image source={instagramIcon} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://x.com/ClimateIITB')}>
                    <Image source={twitterIcon} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.youtube.com/@IDPinClimateStudiesIITBombay')}>
                    <Image source={youtubeIcon} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL('https://www.facebook.com/IITBclimate')}>
                    <Image source={facebookIcon} style={styles.icon} />
                </TouchableOpacity>
            </View>
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
        
    },
    teamList: {
        marginBottom: 10,
        
    },
    teamMember: {
        fontSize: 16,
        marginBottom: 5,
        color: 'black',
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
        gap: 10,
        marginBottom: 30,
    },
    icon: {
        width: 40,
        height: 40,
    },
});

export default ProfileScreen;
