// ** React Imports
import { useState, useEffect, Fragment } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CircularProgress from '@mui/material/CircularProgress'
import toast from 'react-hot-toast'

import { getMyLatestFiles, getAllLatestFiles } from 'src/functions/ChivesDrive'
import { formatStorageSize, formatTimestamp } from 'src/configs/functions'
import { getXweWalletImageThumbnail } from 'src/functions/ChivesWallets'

// ** Third Party Import
import { useTranslation } from 'react-i18next'

import { styled } from '@mui/material/styles'
import Header from '../Layout/Header'
import UploadMyFiles from '../Wallet/UploadMyFiles'
import XweViewFile from '../Wallet/XweViewFile'
import ImageRectangle from './ImageRectangle'

import authConfig from '../../configs/auth'

import { getWalletBalance, getCurrentWalletAddress, getCurrentWallet, getTxsInMemoryXwe } from 'src/functions/ChivesWallets'
import { BalancePlus } from 'src/functions/AoConnect/AoConnect'
import CloudIcon from '@mui/icons-material/Cloud'

const ContentWrapper = styled('main')(({ theme }) => ({
  flexGrow: 1,
  width: '100%',
  padding: theme.spacing(6),
  transition: 'padding .25s ease-in-out',
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4)
  }
}))

// Styled component for the upload image inside the dropzone area
const Img = styled('img')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    marginRight: theme.spacing(15.75)
  },
  [theme.breakpoints.down('md')]: {
    marginBottom: theme.spacing(4)
  },
  [theme.breakpoints.down('sm')]: {
    width: 160
  }
}))

const Drive = ({ encryptWalletDataKey, setDisabledFooter }: any) => {
  // ** Hook
  const { t } = useTranslation()

  const contentHeightFixed = {}

  const [currentAddress, setCurrentAddress] = useState<string>("")
  const [chooseWallet, setChooseWallet] = useState<any>(null)
  const [pageModel, setPageModel] = useState<string>('MyDrive')
  const [HeaderHidden, setHeaderHidden] = useState<boolean>(false)
  const [LeftIcon, setLeftIcon] = useState<string>('')
  const [Title, setTitle] = useState<string>(t('Drive') as string)
  const [RightButtonText, setRightButtonText] = useState<string>('')
  const [RightButtonIcon, setRightButtonIcon] = useState<string>('')

  const [page, setPage] = useState<number>(0)
  const [innerHeight, setInnerHeight] = useState<number | string>(0)

  const [currentBalanceXwe, setCurrentBalanceXwe] = useState<string>("") // Xwe
  const [currentTxsInMemory, setCurrentTxsInMemory] = useState<any>({}) // Xwe
  const [myFiles, setMyFiles] = useState<any[]>([]) // Xwe
  const [myTotalFiles, setMyTotalFiles] = useState<number | null>(null) // Xwe
  const [allFiles, setAllFiles] = useState<any[]>([]) // Xwe
  const [allTotalFiles, setAllTotalFiles] = useState<number | null>(null) // Xwe
  const [currentTx, setCurrentTx] = useState<any>({}) // Xwe
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isLoadingFinishedMy, setIsLoadingFinishedMy] = useState<boolean>(false)
  const [isLoadingFinishedAll, setIsLoadingFinishedAll] = useState<boolean>(false)


  const handleWalletGoHome = () => {
    setRefreshWalletData(refreshWalletData+1)
    setPageModel('MyDrive')
    setLeftIcon('')
    setTitle(t('Drive') as string)
    setRightButtonText('')
    setRightButtonIcon('ic:sharp-add-circle-outline')
    setLeftIcon('mdi:image-outline')
  }

  const handleWalletGoAllDrive = () => {
    setRefreshWalletData(refreshWalletData+1)
    setPageModel('AllDrive')
    setLeftIcon('')
    setTitle(t('Drive') as string)
    setRightButtonText('')
    setRightButtonIcon('ic:sharp-add-circle-outline')
    setLeftIcon('ic:twotone-keyboard-arrow-left')
  }

  const LeftIconOnClick = () => {
    switch(pageModel) {
      case 'UploadMyFiles':
      case 'ViewFile':
        handleWalletGoHome()
        break
      case 'ViewFileFromAllDrive':
        handleWalletGoAllDrive()
        break
      case 'MyDrive':
        setPageModel('AllDrive')
        setLeftIcon('ic:twotone-keyboard-arrow-left')
        break
      case 'AllDrive':
        setPageModel('MyDrive')
        setLeftIcon('ic:twotone-keyboard-arrow-left')
        break
    }
  }

  const RightButtonOnClick = () => {
    if(Number(currentBalanceXwe) < 0.01) {
      toast.error(t('Balance is insufficient, you can get 0.05 Xwe in Faucet page for new user') as string, { duration: 2500, position: 'top-center' })
    }
    else {
      setPageModel('UploadMyFiles')
      setLeftIcon('ic:twotone-keyboard-arrow-left')
      setTitle(t('Upload My Files') as string)
      setRightButtonIcon('')
    }
  }

  const [refreshWalletData, setRefreshWalletData] = useState<number>(0)

  useEffect(() => {
    const handleResize = () => {
      setInnerHeight(window.innerHeight);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;

      console.log("windowHeight", windowHeight);
      console.log("documentHeight", documentHeight);
      console.log("innerHeight", innerHeight);
      console.log("scrollY", scrollY);
      console.log("page", page);

      if (scrollY + windowHeight >= documentHeight) {
        setPage(prevPage => {

          return prevPage + 1;
        });
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    // 初始设置 innerHeight
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [innerHeight, page]);

  useEffect(() => {
    setHeaderHidden(false)
    const currentAddressTemp = getCurrentWalletAddress(encryptWalletDataKey)
    setCurrentAddress(String(currentAddressTemp))
    const getCurrentWalletTemp = getCurrentWallet(encryptWalletDataKey)
    setChooseWallet(getCurrentWalletTemp)
  }, [encryptWalletDataKey]);

  useEffect(() => {
    const processWallets = async () => {
      if(currentAddress && currentAddress.length == 43 && pageModel == 'MyDrive' && page == 0)  {

        //For Xwe
        const currentBalanceTempXwe = await getWalletBalance(currentAddress, 'Xwe');
        if(currentBalanceTempXwe) {
          setCurrentBalanceXwe(Number(currentBalanceTempXwe).toFixed(4).replace(/\.?0*$/, ''))
        }

        const getTxsInMemoryXweData = await getTxsInMemoryXwe()
        setCurrentTxsInMemory(getTxsInMemoryXweData)
        if(currentTxsInMemory && currentTxsInMemory['balance'] && currentTxsInMemory['balance'][currentAddress])  {
          const NewBalance = BalancePlus(Number(currentBalanceTempXwe) , Number(currentTxsInMemory['balance'][currentAddress]))
          setCurrentBalanceXwe(Number(NewBalance).toFixed(4).replace(/\.?0*$/, ''))
        }

        setRightButtonIcon('ic:sharp-add-circle-outline')
        setLeftIcon('mdi:image-outline')

      }

      if(currentAddress && currentAddress.length == 43 && pageModel == 'AllDrive' && page == 0)  {
        //setRightButtonIcon('ic:sharp-add-circle-outline')
        //setLeftIcon('mdi:image-outline')
      }

      if(currentAddress && currentAddress.length == 43 && isLoadingFinishedMy == false && pageModel == 'MyDrive')  {
        setIsLoading(true)
        const getMyLatestFilesData = await getMyLatestFiles(currentAddress, 'Root', page, 15);
        if(getMyLatestFilesData && getMyLatestFilesData.data && getMyLatestFilesData.data.length > 0)  {
          setMyFiles((preV: any)=>(
            [...preV, ...getMyLatestFilesData.data]
          ))
          setMyTotalFiles(getMyLatestFilesData.total)
        }
        if(getMyLatestFilesData && getMyLatestFilesData.data && getMyLatestFilesData.data.length == 0) {
          setIsLoadingFinishedMy(true)
          setMyTotalFiles(getMyLatestFilesData.total)
        }
        setIsLoading(false)
        console.log("getMyLatestFilesData", getMyLatestFilesData)
      }

      if(currentAddress && currentAddress.length == 43 && isLoadingFinishedAll == false && pageModel == 'AllDrive')  {
        setIsLoading(true)
        const getMyLatestFilesData = await getAllLatestFiles(page, 18);
        if(getMyLatestFilesData && getMyLatestFilesData.data && getMyLatestFilesData.data.length > 0)  {
          setAllFiles((preV: any)=>(
            [...preV, ...getMyLatestFilesData.data]
          ))
          setAllTotalFiles(getMyLatestFilesData.total)
        }
        if(getMyLatestFilesData && getMyLatestFilesData.data && getMyLatestFilesData.data.length == 0) {
          setIsLoadingFinishedAll(true)
          setAllTotalFiles(getMyLatestFilesData.total)
        }
        setIsLoading(false)
        console.log("getMyLatestFilesData", getMyLatestFilesData)
      }

    };
    processWallets();
  }, [currentAddress, pageModel, page])

  const handleClickImageInAllDrive = (Item: any) => {
    setCurrentTx(Item)
    setPageModel('ViewFileFromAllDrive')
    setLeftIcon('ic:twotone-keyboard-arrow-left')
    setRightButtonIcon('')
  }


  return (
    <Fragment>
      <Header Hidden={HeaderHidden} LeftIcon={LeftIcon} LeftIconOnClick={LeftIconOnClick} Title={Title} RightButtonText={RightButtonText} RightButtonOnClick={RightButtonOnClick} RightButtonIcon={RightButtonIcon}/>

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: 'auto',
          marginTop: '35px', // Adjust according to the height of the AppBar
          marginBottom: '56px', // Adjust according to the height of the Footer
          paddingTop: 'env(safe-area-inset-top)'
        }}
      >
        <ContentWrapper
            className='layout-page-content'
            sx={{
                ...(contentHeightFixed && {
                overflow: 'hidden',
                '& > :first-of-type': { height: `calc(100% - 104px)` }
                })
            }}
            >

          {pageModel == "AllDrive" && (
            <Grid container alignItems="left" justifyContent="center" spacing={2} sx={{ minHeight: '100%', pt: 0, pl: 0 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0, pb: 0, width: '100%' }}>

              </Box>
              {allFiles && allFiles.length > 0 && allFiles.map((Item: any, Index: number)=>(
                <Grid item key={Index} xs={6} sm={6} md={3} lg={3}>
                  <ImageRectangle item={Item} backEndApi={authConfig.backEndApiXwe} FileType={'image'} handleClickImageInAllDrive={handleClickImageInAllDrive} />
                </Grid>
              ))}
              {isLoading == false && allTotalFiles != null && Number(allTotalFiles) == 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, pb: 0, width: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'left', px: 4, pt: 3 }}
                            onClick={ ()=>{
                              if(Number(currentBalanceXwe) < 0.01) {
                                toast.error(t('Balance is insufficient, you can get 0.05 Xwe in Faucet page for new user') as string, { duration: 2500, position: 'top-center' })
                              }
                              else {
                                setPageModel('UploadMyFiles')
                                setLeftIcon('ic:twotone-keyboard-arrow-left')
                                setTitle(t('Upload My Files') as string)
                                setRightButtonIcon('')
                              }
                            }}>
                    <Img alt='Upload img' src='/images/misc/upload.png' />
                  </Box>
                </Box>
              )}
              {isLoading && isLoadingFinishedAll == false && (
                <Fragment>
                  <Grid container spacing={5}>
                      <Grid item xs={12}>
                          <Box sx={{ mt: 5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                              <CircularProgress sx={{ mb: 4 }} />
                              <Typography sx={{mt: 3}}>{`${t(`Loading`)}`} ...</Typography>
                          </Box>
                      </Grid>
                  </Grid>
                </Fragment>
              )}
              {isLoadingFinishedAll == true && Number(allTotalFiles) > 0 && (
                <Fragment>
                  <Grid container spacing={5}>
                      <Grid item xs={12}>
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                              <Typography sx={{mt: 3}}>{`${t(`Loaded All Files`)}`}</Typography>
                          </Box>
                      </Grid>
                  </Grid>
                </Fragment>
              )}
            </Grid>
          )}

          {pageModel == "MyDrive" && (
            <Grid container alignItems="left" justifyContent="center" spacing={2} sx={{ minHeight: '100%', pt: 0, pl: 0 }}>
              {myFiles && myFiles.length > 0 && myFiles.map((Item: any, Index: number)=>(
                <Grid item xs={12} sx={{ py: 0 }} key={Index}>
                  <Card>
                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, py: 1}}
                            onClick={ ()=>{
                              setCurrentTx(Item)
                              setPageModel('ViewFile')
                              setLeftIcon('ic:twotone-keyboard-arrow-left')
                              setRightButtonIcon('')
                            }}>
                      <CustomAvatar
                        skin='light'
                        color={'primary'}
                        sx={{ mr: 0, width: 43, height: 43 }}
                        src={getXweWalletImageThumbnail(Item)}
                      >
                      </CustomAvatar>
                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '60%', ml: 1.5 }}>
                        <Typography
                          sx={{
                            color: 'text.primary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'left'
                          }}
                        >
                          {Item.table.item_name}
                        </Typography>
                        <Box sx={{ display: 'flex' }}>
                          <Typography
                            variant='body2'
                            sx={{
                              color: `primary.dark`,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                              textAlign: 'left'
                            }}
                          >
                            {formatTimestamp(Item.table.timestamp)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box textAlign="right" sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <Typography variant='h6' sx={{
                          color: `info.dark`,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          mr: 2,
                          ml: 2
                        }}>
                          {formatStorageSize(Item.table.data_size)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              ))}
              {isLoading == false && myTotalFiles != null && Number(myTotalFiles) == 0 && (
                <Box sx={{ display: 'flex', pt: 2, pb: 0, width: '100%', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'left', px: 4, pt: 3 }}
                            onClick={ ()=>{
                              if(Number(currentBalanceXwe) < 0.01) {
                                toast.error(t('Balance is insufficient, you can get 0.05 Xwe in Faucet page for new user') as string, { duration: 2500, position: 'top-center' })
                              }
                              else {
                                setPageModel('UploadMyFiles')
                                setLeftIcon('ic:twotone-keyboard-arrow-left')
                                setTitle(t('Upload My Files') as string)
                                setRightButtonIcon('')
                              }
                            }}>
                    <Img alt='Upload img' src='/images/misc/upload.png' />
                  </Box>
                  <Box sx={{ m: 5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Typography sx={{m: 2, pl: 2}}>{`${t(`You can upload image, pdf, Word, Excel, PowerPoint, and other files to my drive.`)}`}</Typography>
                    <Typography sx={{m: 2, pl: 2}}>{`${t(`Alternatively, you can browse the public files on the blockchain.`)}`}</Typography>
                    <Button sx={{m: 2}} variant="outlined" onClick={()=>handleWalletGoAllDrive()} startIcon={<CloudIcon />} >Browse Public Files</Button>
                  </Box>
                </Box>
              )}
              {isLoading && isLoadingFinishedMy == false && (
                <Fragment>
                  <Grid container spacing={5}>
                      <Grid item xs={12}>
                          <Box sx={{ mt: 5, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                              <CircularProgress sx={{ mb: 4 }} />
                              <Typography sx={{mt: 3}}>{`${t(`Loading`)}`} ...</Typography>
                          </Box>
                      </Grid>
                  </Grid>
                </Fragment>
              )}
              {isLoadingFinishedMy == true && Number(myTotalFiles) > 0 && (
                <Fragment>
                  <Grid container spacing={5}>
                      <Grid item xs={12}>
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                              <Typography sx={{mt: 3}}>{`${t(`Loaded All Files`)}`}</Typography>
                          </Box>
                      </Grid>
                  </Grid>
                </Fragment>
              )}
            </Grid>
          )}

          {pageModel == "UploadMyFiles" && (
            <UploadMyFiles
              currentAddress={currentAddress}
              chooseWallet={chooseWallet}
              handleWalletGoHome={handleWalletGoHome}
              encryptWalletDataKey={encryptWalletDataKey}
              setLeftIcon={setLeftIcon}
              setDisabledFooter={setDisabledFooter}
            />
          )}

          {pageModel == "ViewFile" && (
            <XweViewFile
              currentTx={currentTx}
              currentAddress={currentAddress}
              currentToken={'Xwe'}
              page={page}
              setPage={setPage}
            />
          )}

          {pageModel == "ViewFileFromAllDrive" && (
            <XweViewFile
              currentTx={currentTx}
              currentAddress={currentAddress}
              currentToken={'Xwe'}
              page={page}
              setPage={setPage}
            />
          )}

        </ContentWrapper>
      </Box>
    </Fragment>
  )
}

export default Drive
