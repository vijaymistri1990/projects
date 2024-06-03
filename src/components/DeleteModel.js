import React from 'react'
import { Alert, Button, Modal, ModalBody, ModalFooter, ModalHeader, Spinner } from 'reactstrap'
import * as Icon from 'react-feather'

export default function DeleteModal({ popUpTitle, popUpContent, deletePopUpActive, handleDeletePopUp, primaryLabel, loader, secondaryLabel, popUpContent2 }) {
    return (
        <Modal autoFocus={false} isOpen={deletePopUpActive} toggle={handleDeletePopUp} className='modal-dialog-centered'>
            <ModalHeader toggle={handleDeletePopUp}>{popUpTitle}</ModalHeader>
            <ModalBody>{popUpContent}</ModalBody>
            {popUpContent2 ? <Alert color='warning' className='my-0'>
                <div className='alert-body d-flex align-items-center'>
                    <Icon.AlertCircle size={40} />
                    <span className='ms-50'>{popUpContent2}</span>
                </div>
            </Alert> : ''}
            <ModalFooter>
                <Button type='button' color='secondary' onClick={() => handleDeletePopUp()} label={secondaryLabel}>Cancel</Button>
                <Button type='button' color='danger' onClick={() => handleDeletePopUp('', true)} autoFocus label={loader ? <Spinner size='sm' color='primary' /> : primaryLabel} >Delete</Button>
            </ModalFooter>
        </Modal>
    )
}
